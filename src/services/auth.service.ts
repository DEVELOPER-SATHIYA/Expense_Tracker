// // import { supabase } from "../lib/supabase";

// // const DEFAULT_ACCOUNTS = [
// //   {
// //     name: "Personal",
// //     type: "personal",
// //   },
// //   {
// //     name: "Business",
// //     type: "business",
// //   },
// // ];

// // const DEFAULT_CATEGORIES = [
// //   // Income
// //   { name: "Salary", type: "income" },
// //   { name: "Business Revenue", type: "income" },
// //   { name: "Freelance", type: "income" },
// //   { name: "Investment", type: "income" },
// //   { name: "Interest", type: "income" },
// //   { name: "Refund", type: "income" },
// //   { name: "Other", type: "income" },

// //   // Expense
// //   { name: "Food", type: "expense" },
// //   { name: "Fuel", type: "expense" },
// //   { name: "Shopping", type: "expense" },
// //   { name: "Rent", type: "expense" },
// //   { name: "Electricity", type: "expense" },
// //   { name: "Internet", type: "expense" },
// //   { name: "Mobile", type: "expense" },
// //   { name: "Entertainment", type: "expense" },
// //   { name: "Medical", type: "expense" },
// //   { name: "Travel", type: "expense" },
// //   { name: "Office Expense", type: "expense" },
// //   { name: "Staff Salary", type: "expense" },
// //   { name: "Marketing", type: "expense" },
// //   { name: "Equipment", type: "expense" },
// //   { name: "Other", type: "expense" },
// // ];

// // class AuthService {
// //   async signup(email: string, password: string) {
// //     const { data, error } = await supabase.auth.signUp({
// //       email,
// //       password,
// //     });
// //     console.log("User:", data.user);
// //     console.log("Session:", data.session);
// //     console.log(data.user);
// //     console.log(await supabase.auth.getSession());
// //     if (error) throw error;
// //     if (data.user) {
// //       try {
// //         await this.seedUser(data.user.id);
// //         console.log("Seed completed");
// //       } catch (e) {
// //         console.log(await supabase.auth.getSession());
// //         console.error("Seed failed", e);
// //       }
// //     }
// //     return data;
// //   }

// //   async login(email: string, password: string) {
// //     const { data, error } = await supabase.auth.signInWithPassword({
// //       email,
// //       password,
// //     });

// //     if (error) throw error;

// //     return data;
// //   }

// //   async logout() {
// //     const { error } = await supabase.auth.signOut();

// //     if (error) throw error;
// //   }

// //   async getCurrentUser() {
// //     const {
// //       data: { session },
// //     } = await supabase.auth.getSession();

// //     return session?.user ?? null;
// //   }

// //   async getSession() {
// //     const {
// //       data: { session },
// //       error,
// //     } = await supabase.auth.getSession();

// //     if (error) throw error;

// //     return session;
// //   }

// //   onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
// //     return supabase.auth.onAuthStateChange(callback);
// //   }

// //   async resetPassword(email: string) {
// //     const { error } = await supabase.auth.resetPasswordForEmail(email);

// //     if (error) throw error;
// //   }

// //   async updatePassword(password: string) {
// //     const { error } = await supabase.auth.updateUser({
// //       password,
// //     });

// //     if (error) throw error;
// //   }

// //   private async seedUser(userId: string) {
// //     // Check if already seeded
// //     const { data: existingAccounts } = await supabase
// //       .from("accounts")
// //       .select("id")
// //       .eq("user_id", userId)
// //       .limit(1);

// //     if (existingAccounts && existingAccounts.length > 0) {
// //       return;
// //     }

// //     const accountPayload = DEFAULT_ACCOUNTS.map((account) => ({
// //       ...account,
// //       user_id: userId,
// //     }));

// //     const { error: accountError } = await supabase
// //       .from("accounts")
// //       .insert(accountPayload);

// //     if (accountError) throw accountError;

// //     const categoryPayload = DEFAULT_CATEGORIES.map((category) => ({
// //       ...category,
// //       user_id: userId,
// //     }));

// //     const { error: categoryError } = await supabase
// //       .from("categories")
// //       .insert(categoryPayload);

// //     if (categoryError) throw categoryError;
// //   }
// // }

// // export const authService = new AuthService();


// import { supabase } from "../lib/supabase";

// const DEFAULT_ACCOUNTS = [
//   { name: "Personal", type: "personal" },
//   { name: "Business", type: "business" },
// ] as const;

// const DEFAULT_CATEGORIES = [
//   // Income
//   { name: "Salary", type: "income" },
//   { name: "Business Revenue", type: "income" },
//   { name: "Freelance", type: "income" },
//   { name: "Investment", type: "income" },
//   { name: "Interest", type: "income" },
//   { name: "Refund", type: "income" },
//   { name: "Other", type: "income" },

//   // Expense
//   { name: "Food", type: "expense" },
//   { name: "Fuel", type: "expense" },
//   { name: "Shopping", type: "expense" },
//   { name: "Rent", type: "expense" },
//   { name: "Electricity", type: "expense" },
//   { name: "Internet", type: "expense" },
//   { name: "Mobile", type: "expense" },
//   { name: "Entertainment", type: "expense" },
//   { name: "Medical", type: "expense" },
//   { name: "Travel", type: "expense" },
//   { name: "Office Expense", type: "expense" },
//   { name: "Staff Salary", type: "expense" },
//   { name: "Marketing", type: "expense" },
//   { name: "Equipment", type: "expense" },
//   { name: "Other", type: "expense" },
// ] as const;

// class AuthService {
//   async signup(email: string, password: string) {
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//     });

//     if (error) throw error;

//     // Do NOT seed here.
//     // A session may not exist yet.
//     return data;
//   }

//   async login(email: string, password: string) {
//     const { data, error } =
//       await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });

//     if (error) throw error;

//     if (data.user) {
//       await this.seedUser(data.user.id);
//     }

//     return data;
//   }

//   async logout() {
//     const { error } = await supabase.auth.signOut();

//     if (error) throw error;
//   }

//   async getCurrentUser() {
//     const {
//       data: { user },
//       error,
//     } = await supabase.auth.getUser();

//     if (error) throw error;

//     return user;
//   }

//   async getSession() {
//     const {
//       data: { session },
//       error,
//     } = await supabase.auth.getSession();

//     if (error) throw error;

//     return session;
//   }

//   onAuthStateChange(
//     callback: Parameters<
//       typeof supabase.auth.onAuthStateChange
//     >[0]
//   ) {
//     return supabase.auth.onAuthStateChange(callback);
//   }

//   async resetPassword(email: string) {
//     const { error } =
//       await supabase.auth.resetPasswordForEmail(
//         email
//       );

//     if (error) throw error;
//   }

//   async updatePassword(password: string) {
//     const { error } =
//       await supabase.auth.updateUser({
//         password,
//       });

//     if (error) throw error;
//   }

//   private async seedUser(userId: string) {
//     const { data: existing } = await supabase
//       .from("accounts")
//       .select("id")
//       .eq("user_id", userId)
//       .limit(1);

//     if (existing && existing.length > 0) {
//       return;
//     }

//     const accountPayload = DEFAULT_ACCOUNTS.map(
//       (a) => ({
//         ...a,
//         user_id: userId,
//       })
//     );

//     const { error: accountError } = await supabase
//       .from("accounts")
//       .insert(accountPayload);

//     if (accountError) throw accountError;

//     const categoryPayload =
//       DEFAULT_CATEGORIES.map((c) => ({
//         ...c,
//         user_id: userId,
//       }));

//     const { error: categoryError } =
//       await supabase
//         .from("categories")
//         .insert(categoryPayload);

//     if (categoryError) throw categoryError;
//   }
// }

// export const authService = new AuthService();




import { supabase } from "../lib/supabase";

class AuthService {
  async signup(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    return data;
  }

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return data;
  }

  async logout() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  }

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    return user;
  }

  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    return session;
  }

  onAuthStateChange(
    callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]
  ) {
    return supabase.auth.onAuthStateChange(callback);
  }

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) throw error;
  }

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;
  }
}

export const authService = new AuthService();