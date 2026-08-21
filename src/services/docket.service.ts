import { supabase } from "../lib/supabase";
import { normalizeDocketNumber } from "../utils/dockets";

export type DocketStatus = "in_hand" | "used";
export type DeliveryStatus = "delivered" | "undelivered";

export interface Docket {
  id: string;
  user_id: string;
  account_id: string;
  docket_number: string;
  status: DocketStatus;
  delivery_status: DeliveryStatus | null;
  chargeable_weight: number | null;
  amount: number | null;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
  transactions?: {
    transaction_date: string;
    created_at: string;
  } | null;
}

export interface DocketAssignment {
  docketId: string;
  chargeableWeight: number;
}

class DocketService {
  async getDockets(accountId: string): Promise<Docket[]> {
    const { data, error } = await supabase
      .from("dockets")
      .select(`
        *,
        transactions (
          transaction_date,
          created_at
        )
      `)
      .eq("account_id", accountId)
      .order("docket_number", { ascending: true });

    if (error) throw error;

    return (data ?? []) as Docket[];
  }

  async getInHand(accountId: string): Promise<Docket[]> {
    const { data, error } = await supabase
      .from("dockets")
      .select("*")
      .eq("account_id", accountId)
      .eq("status", "in_hand")
      .order("docket_number", { ascending: true });

    if (error) throw error;

    return (data ?? []) as Docket[];
  }

  async getByTransaction(transactionId: string): Promise<Docket[]> {
    const { data, error } = await supabase
      .from("dockets")
      .select("*")
      .eq("transaction_id", transactionId)
      .order("docket_number", { ascending: true });

    if (error) throw error;

    return (data ?? []) as Docket[];
  }

  async addDockets(accountId: string, numbers: string[]) {
    const uniqueNumbers = [
      ...new Set(
        numbers
          .map((value) => normalizeDocketNumber(value))
          .filter((value): value is string => Boolean(value))
      ),
    ];

    if (uniqueNumbers.length === 0) {
      throw new Error("Enter at least one valid docket number.");
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { data: existing, error: existingError } = await supabase
      .from("dockets")
      .select("docket_number")
      .eq("account_id", accountId)
      .in("docket_number", uniqueNumbers);

    if (existingError) throw existingError;

    const alreadyThere = new Set(
      (existing ?? []).map((row) => row.docket_number)
    );
    const freshNumbers = uniqueNumbers.filter(
      (number) => !alreadyThere.has(number)
    );

    if (freshNumbers.length === 0) {
      throw new Error("All of those docket numbers are already in this account.");
    }

    const { error } = await supabase.from("dockets").insert(
      freshNumbers.map((docket_number) => ({
        account_id: accountId,
        user_id: user.id,
        docket_number,
        status: "in_hand",
      }))
    );

    if (error) throw error;

    return {
      added: freshNumbers.length,
      skipped: uniqueNumbers.length - freshNumbers.length,
      skippedNumbers: uniqueNumbers.filter((number) => alreadyThere.has(number)),
    };
  }

  async deleteDocket(id: string) {
    const { data, error } = await supabase
      .from("dockets")
      .delete()
      .eq("id", id)
      .eq("status", "in_hand")
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      throw new Error("Only unused in-hand dockets can be deleted.");
    }
  }

  async updateDeliveryStatus(id: string, deliveryStatus: DeliveryStatus) {
    const { error } = await supabase
      .from("dockets")
      .update({ delivery_status: deliveryStatus })
      .eq("id", id)
      .eq("status", "used");

    if (error) throw error;
  }

  async syncTransactionDockets(
    accountId: string,
    transactionId: string,
    assignments: DocketAssignment[],
    amount: number
  ) {
    const assignedIds = assignments.map((item) => item.docketId);

    const { data: current, error: currentError } = await supabase
      .from("dockets")
      .select("id")
      .eq("account_id", accountId)
      .eq("transaction_id", transactionId);

    if (currentError) throw currentError;

    const currentIds = (current ?? []).map((row) => row.id);
    const keep = new Set(assignedIds);
    const releaseIds = currentIds.filter((id) => !keep.has(id));

    if (releaseIds.length > 0) {
      const { error: releaseError } = await supabase
        .from("dockets")
        .update({
          status: "in_hand",
          delivery_status: null,
          chargeable_weight: null,
          amount: null,
          transaction_id: null,
        })
        .eq("account_id", accountId)
        .in("id", releaseIds);

      if (releaseError) throw releaseError;
    }

    if (assignments.length === 0) return;

    const { data: rows, error: fetchError } = await supabase
      .from("dockets")
      .select("id, status, transaction_id, docket_number, delivery_status")
      .eq("account_id", accountId)
      .in("id", assignedIds);

    if (fetchError) throw fetchError;

    const found = new Map((rows ?? []).map((row) => [row.id, row]));

    for (const item of assignments) {
      const row = found.get(item.docketId);
      if (!row) {
        throw new Error("One of the selected dockets could not be found.");
      }

      const available =
        row.status === "in_hand" || row.transaction_id === transactionId;

      if (!available) {
        throw new Error(
          `Docket ${row.docket_number} is already used in another booking.`
        );
      }
    }

    for (const item of assignments) {
      const row = found.get(item.docketId);
      const { error } = await supabase
        .from("dockets")
        .update({
          status: "used",
          delivery_status:
            row?.transaction_id === transactionId && row.delivery_status
              ? row.delivery_status
              : "undelivered",
          chargeable_weight: item.chargeableWeight,
          amount,
          transaction_id: transactionId,
        })
        .eq("id", item.docketId)
        .eq("account_id", accountId);

      if (error) throw error;
    }
  }
}

export const docketService = new DocketService();
