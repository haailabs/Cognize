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
contract_abi =[]; # Load the contract
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
