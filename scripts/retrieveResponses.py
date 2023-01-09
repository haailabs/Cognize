from web3 import Web3
import pandas as pd

# Connect to the Ethereum network
w3 = Web3(Web3.HTTPProvider("https://polygon-mumbai.g.alchemy.com/v2/kwNMLxtwAtXS_9HN_siSUDMgcCQqDZF5"))

# Create a new account
account = w3.eth.account.create('YourPassword!@')

# Print the address and private key of the new account
print(f"Address: {account.address}")
print(f"Private key: {account.privateKey.hex()}")

# Set the address of the DAOkit contract
contract_address = "0x4567026fD283ee95421B0271dd3cA3E6daa73f4b"

# Set the ABI (Application Binary Interface) of the contract
contract_abi = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_tokenContract",
				"type": "address"
			},
			{
				"internalType": "uint256[]",
				"name": "_fees",
				"type": "uint256[]"
			}
		],
		"name": "initialize",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "requestPayment",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "enum DAOkit.types",
				"name": "_HIPType",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "_numOptions",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_numClasses",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_duration",
				"type": "uint256"
			}
		],
		"name": "submitHIP",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_proposer",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			},
			{
				"internalType": "uint256[]",
				"name": "_response",
				"type": "uint256[]"
			}
		],
		"name": "submitResponse",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "_number",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "getBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "_balance",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "i",
				"type": "uint256"
			}
		],
		"name": "getFee",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "_fee",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_proposer",
				"type": "address"
			}
		],
		"name": "getHIPCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "_count",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getNumProposers",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "_numProposers",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "i",
				"type": "uint256"
			}
		],
		"name": "getProposer",
		"outputs": [
			{
				"internalType": "address",
				"name": "_proposer",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_proposer",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_indexHIP",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_indexResponse",
				"type": "uint256"
			}
		],
		"name": "getResponse",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "_response",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "HIPs",
		"outputs": [
			{
				"internalType": "enum DAOkit.types",
				"name": "HIPType",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "numOptions",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "numClasses",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "creationDate",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "duration",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "numResponses",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "responded",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "responseRefs",
		"outputs": [
			{
				"internalType": "address",
				"name": "proposer",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

# Load the contract
contract = w3.eth.contract(address=contract_address, abi=contract_abi)

# Set the address of the retriever
retriever_address = account.address


# Set the address of the proposer
proposer_address = "0x3E960E93B811D5f6727eeBe48eA5bB6A73639306"

# Set the index of the HIP
index = 0

# Retrieve the HIP struct
hip = contract.functions.HIPs(proposer_address, index).call()

# Extract the numResponses field from the HIP struct
num_responses = hip[5]

# Initialize an empty list to store the responses
responses = []

# Call the getResponse function for all values of i between 0 and numResponses
for i in range(num_responses):
    response = contract.functions.getResponse(proposer_address, index, i).call()
    responses.append(response)

# Create a data frame from the responses
df = pd.DataFrame(responses)

# Print the data frame
print(df)
