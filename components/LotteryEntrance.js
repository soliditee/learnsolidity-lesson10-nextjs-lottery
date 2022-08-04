import { useEffect, useState } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import { contractAddresses, abi } from "../constants"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const { authenticate, isAuthenticated, isAuthenticating, user, account, logout } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const lotteryAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()

    const {
        runContractFunction: buyTicket,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "buyTicket",
        params: {},
        msgValue: entranceFee,
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUI() {
        const entranceFeeFromContract = await getEntranceFee()
        const numPlayersFromContract = (await getNumberOfPlayers()).toString()
        const recentWinnerFromContract = await getRecentWinner()
        setEntranceFee(entranceFeeFromContract)
        setNumPlayers(numPlayersFromContract)
        setRecentWinner(recentWinnerFromContract)
    }

    const login = async () => {
        if (!isAuthenticated) {
            await authenticate({ signingMessage: "Log in using Moralis" })
                .then(function (user) {
                    console.log("logged in user:", user)
                })
                .catch(function (error) {
                    console.log(error)
                })
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Completed Successfully!",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div className="p-5">
            Welcome to the Lottery!
            {lotteryAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white rounded px-2 py-2 ml-auto font-bold"
                        onClick={async () => {
                            await buyTicket({
                                onSuccess: handleSuccess,
                                onError: (err) => console.log(err),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? <div className="animate-spin rounded-full h-8 w-8 border-b-2"></div> : <div>Buy Lottery Ticket</div>}
                    </button>
                    <div>Entrance Fee: {ethers.utils.formatEther(entranceFee)} ETH</div>
                    <div>Number of players: {numPlayers}</div>
                    <div>Recent Winner: {recentWinner}</div>
                </div>
            ) : (
                <div>Missing Lottery Address. Please make sure you're on the correct network.</div>
            )}
        </div>
    )
}
