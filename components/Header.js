import { ConnectButton } from "web3uikit"

export default function Header() {
    return (
        <div className="p-5 border-b-2 flex flex-row">
            <h1 className="px-4 py-4 font-semibold text-2xl">Decentralized Lottery</h1>
            <div className="ml-auto py-4 px-4">
                <ConnectButton moralisAuth={false} />
            </div>
        </div>
    )
}
