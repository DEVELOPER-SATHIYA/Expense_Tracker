import { ArrowRightLeft, Briefcase, User } from "lucide-react";

import type { Account } from "../../services/account.service";

import { useAccount } from "../../context/AccountContext";
import { createPortal } from "react-dom";

interface Props {
    open: boolean;

    account: Account | null;

    onClose: () => void;
}

export default function SwitchAccountModal({
    open,
    account,
    onClose,
}: Props) {
    const {
        currentAccount,
        switchAccount,
    } = useAccount();

    if (!open || !account) return null;

    const handleSwitch = () => {
        switchAccount(account);

        onClose();
    };

    return createPortal(
        <>
            {/* Overlay */}

            <div
                className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <div
                    className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >

                    <div className="border-b border-slate-700 p-5">

                        <h2 className="text-xl font-semibold text-white">
                            Switch Account
                        </h2>

                        <p className="text-sm text-slate-400 mt-1">
                            You're about to switch your active account.
                        </p>

                    </div>
                    <div className="p-5 space-y-5 flex flex-row gap-5  align-center">
                        <div className="flex-1">
                            <p className="text-xs uppercase text-slate-400 mb-2">
                                Current Account
                            </p>
                            <div className="flex  items-center gap-3 rounded-xl bg-slate-800 p-3">
                                <div className="h-11 w-11 rounded-lg bg-slate-700 flex items-center justify-center">
                                    {currentAccount?.type === "business" ? (
                                        <Briefcase size={18} />
                                    ) : (
                                        <User size={18} />
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-white">
                                        {currentAccount?.name}
                                    </p>
                                    <p className="text-sm capitalize text-slate-400">
                                        {currentAccount?.type}
                                    </p>
                                </div>
                            </div>

                        </div>
                        <div className="flex items-center justify-center">
                            <ArrowRightLeft
                                size={28}
                                className="text-blue-400"
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs uppercase text-slate-400 mb-2">
                                Switch To
                            </p>
                            <div className="flex items-center gap-3 rounded-xl border border-blue-500 bg-blue-500/10 p-3">
                                <div className="h-11 w-11 rounded-lg bg-blue-600 flex items-center justify-center">
                                    {account.type === "business" ? (
                                        <Briefcase size={18} />
                                    ) : (
                                        <User size={18} />
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-white">
                                        {account.name}
                                    </p>
                                    <p className="text-sm capitalize text-slate-300">
                                        {account.type}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 border-t border-slate-700 p-5">
                        <button
                            onClick={onClose}
                            className="rounded-lg border border-slate-600 px-5 py-2 text-white hover:bg-slate-800 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSwitch}
                            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 transition"
                        >
                            Switch Account
                        </button>

                    </div>

                </div>

            </div>
        </>,
        document.body
    );
}