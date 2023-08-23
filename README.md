<img src="https://cognize.ndehouche.repl.co/logo.png" alt="Cognize" style="width:100px;"/>

# Cognize: Full-Stack Expert Elicitation DApp

**Video Walkthrough:** _[Watch](https://www.youtube.com/watch?v=MkgwUqmRVUQ)_
**Implementation:** _[Visit](https://cognize.ndehouche.repl.co/)_
Note: Make sure to clone the Repl and run the server, as describe in 5. Running the Repository, as Replit does not provide a persistent server.

## 1. Overview
Cognize is a decentralized solution that enables domain-expert DAOs to monetize their expertise and knowledge by responding to cognitive tasks. Through its integration with Ocean Protocol, Cognize facilitates experts, such as software, legal or medical professionals, to monetize their knowledge.

This repository houses a comprehensive solution incorporating backend, frontend, and smart contracts essential for Cognize's operation. The user interface is designed using Vanilla JavaScript, with minimal dependencies, ensuring it can be integrated across various development environments.

## 3. Verified Human Expert Knowledge
As large language models become increasingly prevalent, the significance of verified human expert knowledge has never been more apparent. Human expertise provides a valuable foundation for generating quality data, crucial for training these models or fine-tuning them using reinforcement learning from human feedback. The quality of data is paramount in ensuring the efficacy and accuracy of these models.

## 4. Repository Structure
**Stack:**
- Smart Contracts: Solidity
- Web3: Web3.js, Wallet Connect
- Backend: Node.js
- Middleware: KOA
- Front-end: JavaScript, HTML, CSS (UIkit, Font Awesome)
- Database: MongoDB

**Main Files:**
- `/contracts/Cognize.sol`: Main smart contract for task management.
- `/contracts/NFT.sol`: The NFT contract for expert qualification.
- `/app/server.js`: Backend server implementation.
- `/app/client.js`: Handles web3 and backend interactions.
- `/app/contracts.js`: Contains the address and ABI of the main and token contracts.
- `/app/script.js`: Implements UI functionalities.
- `/python/retrieveResponses.py`: Python script for data consumption from Ethereum.
- `/discord_bots/DiscordUpdates.js`: Discord bot for updates on new tasks.
- `/discord_bots/DiscordToNotion.js`: Discord to Notion bot for saving important messages.


## 5. Running the Repository
```
git clone [Repository Link]
cd Cognize/app
npm install
node server.js
```
Visit `http://localhost:3000` on your browser.

## 7. Contract Documentation

**constructor()**: Initializes the contract and sets the owner address to the sender of the transaction.

**initialize(address _tokenContract)**: Initializes the contract by setting the address of the ERC-1155 contract used to qualify reviewers.

**submitHIP(uint _duration, bytes32 _pdfHash, bytes32 _requestHash, uint32 _specialties, uint _fee, uint _index) returns(uint _id)**: Allows a user to submit a HIP (Human Intelligence Primitive), which represents a request for review.

**submitResponse(uint8 _specialty, uint _id, uint _responseValue, bytes32 _responseHash) returns(uint _number)**: Allows a user to submit a response to a HIP.

**withdrawPayment(uint _responseIndex)**: Enables a respondent to withdraw payment for a specific response if the HIP is closed.

**getNumProposers() returns(uint _numProposers)**: Returns the total number of proposers.

**getNumHIPs() returns(uint)**: Returns the total number of HIPs.

**getProposer(uint i) returns(address _proposer)**: Returns the address of the i-th proposer.

**getHIPCount(address _proposer) returns(uint _count)**: Returns the total number of HIPs submitted by a proposer.

**getResponse(uint _indexHIP, uint _indexResponse) returns(uint response, bytes32 responseHash)**: Returns a particular response to a HIP.

Several modifiers exist in the contract (like onlyIfPaidEnough, onlyIfHoldsNFT, etc.) that check certain conditions before executing their respective functions.




## 8. Data Consumption in Python

The `retrieveResponses.py` script facilitates the extraction of responses from the Ethereum network. This script uses the Web3 Python module to connect to the Ethereum network, interacts with the contract to fetch responses, and structures them into a pandas DataFrame.

Here's a brief overview of how the script functions:
1. It establishes a connection with the Ethereum network.
2. Creates a new account.
3. Defines the contract address and ABI, and then initializes the contract.
4. Sets the retriever's address.
5. Defines the proposer's address and the index of the HIP (Human Intelligence Primitive).
6. Retrieves the HIP struct and extracts the `numResponses` field.
7. Iterates over all responses, fetches them, and appends them to a list.
8. Structures the responses into a pandas DataFrame and prints it.

You can find this script in the repository under `/python/retrieveResponses.py`.

## 9. Discord Bots

### 1. Discord Updates

This bot automatically posts a notification in your server when a new cognitive task is added. It is built using the `discord.js` library.

Main functionalities:
- Sets up the Discord bot and logs in.
- Defines a helper function (`sendToDiscord`) that sends structured messages to a specific Discord channel.
- Adds the `sendToDiscord` function call in a POST route, ensuring that every time new data is posted, a notification is sent to Discord.

You can find this bot in the repository under `/discord_bots/DiscordUpdates.js`.

### 2. Discord to Notion

This bot allows the recording of valuable messages and discussions related to cognitive tasks directly to Notion, but only when a moderator approves them. For more detailed implementation and usage, you can visit the GitHub repository under `/discord-to-notion/blob/main/index.js`. [discord-to-notion].

You can find this bot in the repository under `/discord_bots/DiscordToNotion.js`.

## 10. License
All code, except the NFT contract, is shared under a CC-BY-NC-SA-4.0 license. Logos are trademarks of their respective owners and are used for illustrative purposes only.

## 11. Acknowledgements
Our sincere thanks to Ocean Protocol for their support through the Shipyard Grant.

