import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Briefcase, User } from "lucide-react";
import { useAccount } from "../../context/AccountContext";
import SwitchAccountModal from "./SwitchAccountModal";

export default function AccountSwitcher() {
    const {
        accounts,
        currentAccount,
    } = useAccount();

    const [open, setOpen] = useState(false);

    const [selectedAccount, setSelectedAccount] = useState<
        typeof currentAccount
    >(null);

    const [showModal, setShowModal] = useState(false);

    const handleSelect = (account: typeof currentAccount) => {
        if (!account) return;

        if (account.id === currentAccount?.id) {
            setOpen(false);
            return;
        }

        setSelectedAccount(account);

        setShowModal(true);

        setOpen(false);
    };

    return (
        <>
            <div className="relative">

                <button
                    onClick={() => setOpen(!open)}
                    className="w-full flex items-center justify-between rounded-xl 
                    bg-slate-800 p-3 hover:bg-slate-700 transition"
                >
                    <div className="flex items-center gap-3">

                        <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">

                            {currentAccount?.type === "business" ? (
                                <Briefcase size={18} />
                            ) : (
                                <User size={18} />
                            )}

                        </div>

                        <div className="text-left">

                            <p className="font-semibold">
                                {currentAccount?.name}
                            </p>

                           
                        </div>

                    </div>

                    {open ? (
                        <ChevronUp size={18} />
                    ) : (
                        <ChevronDown size={18} />
                    )}
                </button>

                <div
                    className={`
                            absolute
                            left-0
                            right-0
                            mt-2
                            rounded-xl
                            bg-slate-800
                            border
                            border-slate-700
                            shadow-2xl
                            transition-all
                            duration-200
                            overflow-hidden
                            z-50

                            ${open
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-95 pointer-events-none"
                        }
                    `}
                >
                    <div className="p-2">

                        <div className="px-4 py-3 border-b border-slate-700">

                            <p className="text-xs uppercase tracking-wider text-slate-400">
                                Switch Account
                            </p>

                        </div>

                        {accounts.map((account) => (
                            <button
                                key={account.id}
                                onClick={() => handleSelect(account)}
                                className={`
                                    w-full
                                    flex
                                    items-center
                                    justify-between
                                    rounded-xl
                                    px-3
                                    mb-3
                                    py-3
                                    transition

                                    ${account.id === currentAccount?.id
                                        ? "bg-blue-600/20 border border-blue-500"
                                        : "hover:bg-slate-700"
                                    }
                                    `}
                            >
                                <div className="flex items-center gap-3">

                                    <div className="h-9 w-9 rounded-lg bg-slate-700 flex items-center justify-center">

                                        {account.type === "business" ? (
                                            <Briefcase size={17} />
                                        ) : (
                                            <User size={17} />
                                        )}

                                    </div>

                                    <div className="text-left">

                                        <p>{account.name}</p>

                                        <p className="text-xs text-gray-400 capitalize">
                                            {account.type}
                                        </p>

                                    </div>

                                </div>

                                {account.id === currentAccount?.id && (
                                    <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">

                                        <Check
                                            size={14}
                                            className="text-white"
                                        />

                                    </div>
                                )}

                            </button>
                        ))}

                    </div>
                </div>

            </div>

            <SwitchAccountModal
                open={showModal}
                account={selectedAccount}
                onClose={() => setShowModal(false)}
            />
        </>
    );
}