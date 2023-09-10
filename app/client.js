//Web3 Init
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
var walletModal;
const evmChains = window.evmChains;

// Chosen wallet provider given by the dialog window
let provider;
// Address of the selected account
var selectedAccount;
var accounts;
// Qualification NFTs
var NFT;
// Number of cognitive task requests
var numRequests;
//initial style
var initialDisplay
// A variable to store the index of the selected card

var selectedCardIndex = null;
var numHIPs;
//SHA256
async function sha256(message) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
//UNIX time conversion
function convertUnixTime(unixSeconds) {
  const days = Math.floor(unixSeconds / (24 * 60 * 60));
  const hours = Math.floor((unixSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((unixSeconds % (60 * 60)) / 60);
  const seconds = Math.floor(unixSeconds % 60);

  let result = "";
  if (days > 0) {
    result += `${days} day${days > 1 ? "s" : ""}`;
  } else if (hours > 0) {
    result += `${hours} hour${hours > 1 ? "s" : ""}`;
  } else if (minutes > 0) {
    result += `${minutes} minute${minutes > 1 ? "s" : ""}`;
  } else if (seconds > 0) {
    result += `${seconds} second${seconds > 1 ? "s" : ""}`;
  } else {
    result = "Closed";
  }

  return result;
}
/**
 * Setup Web3 utilities
 */
async function init() {
  console.log("WalletConnectProvider is", WalletConnectProvider);
  // Tell Web3modal what providers we have available.
  // Built-in web browser provider (only one can exist as a time)
  // like MetaMask, Brave or Opera is added automatically by Web3modal
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        // Mikko's test key - don't copy as your mileage may vary
        infuraId: "8043bb2cf99347b1bfadfb233c5325c0",
      }
    }
  };

  walletModal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions, // required
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
  });
}
var web3 = new Web3(window.ethereum);
var db;

//Refresh list of tasks
async function refresh() {

  let HIPcount = 0;
  await axios.post("/getMyJSON").then((response) => {
    db = response.data;
  });


  numHIPs = db.length;

  const board = document.getElementById("board");
  const sideboard = document.getElementById("sideboard");
  document.getElementsByClassName("loader")[0].style.display = "flex";
  board.innerHTML = "";
  //Counting the number of tasks of each type

  for (var i = numHIPs - 1; i >= 0; i--) {

    HIPcount++;


    // Create the main li element
    let li = document.createElement('li');
    li.id = i;
    let taskType = db[i].type.toLowerCase();
    li.className = taskType + '-card';
    li.setAttribute('data-tags', db[i].title);

    // Create the anchor element
    let anchor = document.createElement('a');
    anchor.id = i;
    anchor.className = 'view';
    anchor.addEventListener('click', async function(event) {
      event.preventDefault();
      const isConnected = await checkWalletConnection();


      if (isConnected) {
        document.getElementById('app').style.display = 'none';


        // Fetch the container with ID "respond" and the "box" div inside it
        const respondContainer = document.getElementById("respond");
        const boxDiv = respondContainer.querySelector(".box");
        const sideBoxDiv = respondContainer.querySelector(".sideBox");
        boxDiv.innerHTML = "";
        sideBoxDiv.innerHTML = "";
        // Get the parent element of the clicked anchor
        // Ensure we're referring to the anchor, even if a child element was clicked
        let clickedAnchor = event.target;
        while (clickedAnchor && clickedAnchor.tagName !== 'A') {
          clickedAnchor = clickedAnchor.parentElement;
        }

        let parentId = parseInt(clickedAnchor.id, 10);
        currentBlock = await web3.eth.getBlock("latest");
        // Append the generated task info at the  the "box" div
        // Add the header to the task info
        const header = document.createElement('h3');
        header.innerHTML = db[parentId].title;
        const returnLink = document.createElement('a');
        returnLink.classList.add('no-highlight', 'return');
        //Activate return button

        returnLink.addEventListener('click', function(e) {
          e.preventDefault();

          goBack();
        });

        const smallTag = document.createElement('small');
        smallTag.style.color = 'var(--dark)';
        const spanTag = document.createElement('span');
        const icon = document.createElement('i');
        icon.setAttribute('data-eva', 'chevron-left-outline');
        spanTag.appendChild(icon);
        smallTag.appendChild(spanTag);
        smallTag.innerHTML += 'Return';
        returnLink.appendChild(smallTag);
        header.appendChild(returnLink);
        // Append the header to the sideboxDiv
        sideBoxDiv.appendChild(header);

        // Append the generated task info to the boxDiv after the header
        sideBoxDiv.appendChild(generateTaskInfo(parentId, currentBlock));
        if (db[parentId].type == "Choice") {// Append choice div and cards to the boxDiv 
          boxDiv.appendChild(generateChoiceDiv(parentId));
        }
        else if (db[parentId].type == "Ranking") {
          // Append ranking div and cards to the boxDiv 
          boxDiv.appendChild(generateRankingDiv(parentId));
        }
        if (db[parentId].type == "Sorting") {
          // Append sorting div and cards to the boxDiv 
          boxDiv.appendChild(generateSortingDiv(parentId));
        }
        else if (db[parentId].type == "Labelling") {
          // Append labelling div and cards to the boxDiv 
          boxDiv.appendChild(generateLabellingDiv(parentId));
        }

        eva.replace();
        // Function to update the choice
        const choiceIcons = document.querySelectorAll('.choice-icon');
        choiceIcons.forEach(icon => {

          icon.addEventListener('click', function() {

            // Deactivate all icons
            choiceIcons.forEach(i => i.classList.remove('active'));

            // Activate the clicked icon
            this.classList.add('active');
            // Store the data-id of the parent card in selectedCardIndex

            selectedCardIndex = this.closest('.uk-card').getAttribute('data-id');
          });
        })

        // Function to update the ranking of each card 

        updateRankings();
        //Function to update sorting 
        assignSorting();
        //Function to update labelling
        assignLabel();
        // Attach an event listener to the end of the sortable action
        UIkit.util.on('#option-cards', 'stop', function() {
          updateRankings();
        });
        //close the dropdown


        // Listen for clicks on the document
        document.addEventListener('click', function(e) {
          const dropdown = document.querySelector('.sorting-dropdown');
          const sortingIcon = document.querySelector('.sorting-icon');
          const labeldropdown = document.querySelector('.label-dropdown');
          const labelIcon = document.querySelector('.label-icon');

          // Check if clicked target is neither the dropdown nor the sorting icon
          if (dropdown && !dropdown.contains(e.target) && !sortingIcon.contains(e.target)) {
            dropdown.classList.add('uk-invisible');
          }

          // Check if clicked target is neither the dropdown nor the sorting icon
          if (labeldropdown && !labeldropdown.contains(e.target) && labelIcon && !labelIcon.contains(e.target)) {
            labeldropdown.classList.add('uk-invisible');
          }

        });

        respondContainer.style.display = 'block';
        //Display response div
        requestAnimationFrame(function() {
          respondContainer.style.transform = 'translateX(0)';
        });
      }
      else {
        alert("Wallet not connected");
        // Handle the scenario where the wallet isn't connected, if needed
      }
    });




    // Content div
    let contentDiv = document.createElement('div');
    contentDiv.className = 'content';

    // Icon div inside the content
    let iconDiv = document.createElement('div');
    iconDiv.className = 'icon';
    let icon = document.createElement('i');
    if (taskType == "choice") {
      icon.setAttribute('data-eva', 'award-outline');
    }
    else if (taskType == "ranking") {
      icon.setAttribute('data-eva', 'bar-chart-2-outline');
      li.style.setProperty("--color", "var(--primary-2)");
    }
    if (taskType == "sorting") {
      icon.setAttribute('data-eva', 'keypad-outline');
      li.style.setProperty("--color", "var(--primary-3)");
    }
    if (taskType == "labelling") {
      icon.setAttribute('data-eva', 'pricetags-outline');
      li.style.setProperty("--color", "var(--primary-4)");

    }
    iconDiv.appendChild(icon);

    // Text div inside the content
    let textDiv = document.createElement('div');
    textDiv.className = 'text';
    // Add title
    textDiv.appendChild(document.createTextNode(db[i].title));

    // Create description
    const span = document.createElement('span');
    span.className = 'type-' + taskType;
    span.innerText = taskType.toUpperCase();
    textDiv.appendChild(span);

    // Create the small element and add it to the div
    const small = document.createElement('small');
    small.innerText = db[i].description
    textDiv.appendChild(small);

    //Compute remaining time
    let currentBlock;
    let timeLeft;
    // Get the latest block details
    if (web3.currentProvider) {
      currentBlock = await web3.eth.getBlock("latest");

      if (typeof currentBlock === "undefined") {
        timeLeft = "Unknown";
      } else {
        currentBlock = currentBlock.timestamp;

        timeLeft =

          convertUnixTime(
            -parseInt(currentBlock) +
            parseInt(db[i].date) +
            parseInt(db[i].duration)
          );
      }
    } else {
      timeLeft = " No wallet";
    }

    // Icon row inside the text
    let iconRowDiv = document.createElement('div');
    iconRowDiv.className = 'icon-row';
    iconRowDiv.innerHTML = `
        <div class="icon-text-container ">
            <i data-eva="clock-outline" class="small-icon"></i>
            <p class="small-text choice">`+ timeLeft + `</p>
        </div>
        <div class="icon-text-container">
            <i class="small-icon " data-eva="credit-card-outline"></i>
            <p class="small-text">`+
      weiToEth(db[i].bounty) + ` ETH</p>
        </div>
        <div class="icon-text-container">
            <i data-eva="message-circle-outline" class="small-icon choice"></i>
            <p class="small-text choice">`+ db[i].numResponses + ` responses</p>
        </div>
    `;
    textDiv.appendChild(iconRowDiv);

    // Append icon and text div to content
    contentDiv.appendChild(iconDiv);
    contentDiv.appendChild(textDiv);

    // Chevron icon outside the content
    let chevronIcon = document.createElement('i');
    chevronIcon.setAttribute('data-eva', 'chevron-right-outline');

    // Append content and chevron to anchor
    anchor.appendChild(contentDiv);
    anchor.appendChild(chevronIcon);

    // Append anchor to li
    li.appendChild(anchor);

    board.appendChild(li);


  }
  document.getElementsByClassName("loader")[0].style.display = "none";
  eva.replace();

} //End of refresh function declaration

/**
 * Main entry point.
 */

//Contracts instanciation
const contract = new web3.eth.Contract(CognizeABI, CognizeAddress);
contract.setProvider(window.ethereum);
const tokenContract = new web3.eth.Contract(NFTABI, NFTAddress);

tokenContract.setProvider(window.ethereum);

//Check whether wallet is connected
async function checkWalletConnection() {
  // Check if Ethereum provider exists
  if (window.ethereum) {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    const chainId = await window.ethereum.request({ method: "eth_chainId" });

    // Check if connected to Goerli testnet (chainId: "0x5")
    if (chainId !== "0x5") {
      // Switch to Goerli testnet
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x5" }],
        });
      } catch (error) {
        if (error.code === 4902) {
          // Chain not added, you can add it here
          alert("Please connect to the Goerli testnet manually.");
        } else {
          console.error(error);
        }
      }
    }

    if (accounts.length > 0) {
      await refreshAccountData();
    }

    return accounts.length > 0;  // Returns true if connected, false otherwise
  } else {
    alert("Ethereum provider is not available.");
    return false;
  }
}


// Check the NFT IDs owned by msg.sender
async function checkNFTs() {
  try {
    // Assuming you have already set up a provider and connected to it
    const provider = new Web3(window.ethereum);

    // Assuming the contract address is stored in a variable called contractAddress
    const tokenContract = new provider.eth.Contract(NFTABI, NFTAddress);

    const balance = await tokenContract.methods
      .balanceOf(window.ethereum.selectedAddress)
      .call();

    if (balance > 0) {
      console.log(`User owns ${balance} NFT(s).`);
    } else {
      console.log("User does not own any NFTs.");
    }
  } catch (error) {
    console.error("Error checking NFT ownership:", error);
  }
}



/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {
  // Display fully loaded UI for wallet data
  subnav = document.getElementById("connected");
  loginButton = document.getElementById("btn-connect");
  subnav.style.display = "flex";
  loginButton.style.display = "none";
  // Get a Web3 instance for the wallet



  let chainId = await web3.eth.net.getId();



  // Get list of accounts of the connected wallet
  accounts = await web3.eth.getAccounts();
  selectedAccount = accounts[0];





  prepareDiv = document.querySelectorAll(".prepare");
  prepareDiv.forEach((el) => (el.style.display = "none"));
  connectedDiv = document.querySelectorAll(".connected");
  connectedDiv.forEach((el) => (el.style.display = "block"));
  userAddress = document.getElementById("user");
  userAddress.innerHTML =
    selectedAccount.substring(0, 5) +
    "..." +
    selectedAccount.substr(selectedAccount.length - 4, 4);


  //Check NFTs
  await checkNFTs();
}

async function onConnect() {


  try {
    provider = await walletModal.connect();
    web3 = new Web3(provider);
    chainId = await web3.eth.net.getId();

    // Check if connected to Goerli testnet (chainId: 5)
    if (chainId !== 5) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x5" }],
        });
        // After switching, update the chainId
        chainId = await web3.eth.net.getId();
      } catch (error) {
        if (error.code === 4902) {
          // Chain not added, you can add it here
          alert("Please connect to the Goerli testnet manually.");
        } else {
          console.error(error);
        }
      }
    }

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
      (async () => {
        await fetchAccountData();
      })();
    });

    // Subscribe to network change
    provider.on("networkChanged", (chainId) => {
      (async () => {
        await fetchAccountData();
      })();
    });

    await refreshAccountData();

    return "success"; // Return success if everything goes well

  } catch (e) {
    console.log("Could not get a wallet connection", e);
    return e.message; // Return the error message if an exception is caught
  }
}





async function refreshAccountData() {
  // If any current data is displayed when
  // the user is switching acounts in the wallet
  // immediate hide this data

  prepareDiv = document.querySelectorAll(".prepare");
  prepareDiv.forEach((el) => (el.style.display = "none"));

  connectedDiv = document.querySelectorAll(".connected");
  connectedDiv.forEach((el) => (el.style.display = "block"));
  //document.querySelector("#qualification").style.display = "none";
  //document.querySelector("#review-area").style.display = "block";

  // Disable button while UI is loading.
  // fetchAccountData() will take a while as it communicates
  // with Ethereum node via JSON-RPC and loads chain data
  // over an API call.

  await fetchAccountData();
}


async function onDisconnect() {
  try {
    if (provider) {
      // Unsubscribe from any event if necessary
      if (provider.removeAllListeners) {
        provider.removeAllListeners("chainChanged");
        provider.removeAllListeners("networkChanged");
      }

      // If using web3Modal, clear the cached provider
      if (Web3Modal) {
        walletModal.clearCachedProvider();
      }

      provider = null;
      chainId = null;

      // UI changes when disconnected
      const subnav = document.getElementById("connected");
      const loginButton = document.getElementById("btn-connect");
      subnav.style.display = "none";
      loginButton.style.display = "block";

      const prepareDiv = document.querySelectorAll(".prepare");
      prepareDiv.forEach((el) => (el.style.display = "block"));
      const connectedDiv = document.querySelectorAll(".connected");
      connectedDiv.forEach((el) => (el.style.display = "none"));

      const userAddress = document.getElementById("user");
      userAddress.innerHTML = "Not Connected";

      console.log("Disconnected from the wallet");

      await goBack();

      return "disconnected"; // Return disconnected if everything goes well
    }
  } catch (e) {
    console.log("Error while disconnecting the wallet", e);
    return e.message; // Return the error message if an exception is caught
  }
}



document.addEventListener("DOMContentLoaded", async function() {
  await refresh();
  await init();
  document.querySelector("#btn-connect").addEventListener("click", onConnect);
  await onConnect();
  initialDisplay = window.getComputedStyle(document.getElementById('app')).display;

  document.getElementById("mintButton").addEventListener("click", async () => {
    const isConnected = await checkWalletConnection();

    if (isConnected) {
      console.log("Wallet connected. Minting NFT...");

      // Get the current account/address
      const accounts = await web3.eth.getAccounts();
      const currentAddress = accounts[0];

      // Call the mint function of the token contract
      try {
        await tokenContract.methods.mint(currentAddress, 1).send({ from: currentAddress });
        console.log("NFT minted successfully");
      } catch (error) {
        console.error("Error minting NFT:", error);
      }

    } else {
      alert("Wallet not connected");
      // Handle the scenario where the wallet isn't connected, if needed
    }
  });

  document.getElementById("btn-add").addEventListener("click", async () => {
    const isConnected = await checkWalletConnection();

    if (isConnected) {
      console.log("Success");
      document.getElementById('app').style.display = 'none';
      var submitDiv = document.getElementById('submit');
      submitDiv.style.display = 'block';
      requestAnimationFrame(function() {
        submitDiv.style.transform = 'translateY(0)';
      });
    } else {
      alert("Wallet not connected");
      // Handle the scenario where the wallet isn't connected, if needed
    }
  });

  document.getElementById("new-task").addEventListener("click", async function(e) {
    e.preventDefault();


    // Array of all input fields that should be checked
    let fields = [
      document.getElementById("type"),
      document.getElementById("title"),
      document.getElementById("description"),
      document.getElementById("attachment"),
      document.getElementById("num-options")
    ];

    let allFieldsFilled = true;
    let numOptions = parseInt(document.getElementById("num-options").value);

    if (numOptions < 2) {
      alert("A task must include at least two options.")
      allFieldsFilled = false;
    }

    fields.forEach(field => {
      // Remove existing error class if any
      field.classList.remove("uk-form-danger");

      // Check if the field is empty
      if (!field.value.trim()) {
        allFieldsFilled = false;
        // Highlight the field with UIkit's danger class
        field.classList.add("uk-form-danger");
      }
    });

    // If all fields are filled, submit the form
    if (allFieldsFilled) {
      // If using a real form submission, you can uncomment the next line
      // e.target.form.submit();
      console.log("Form submitted");
      // Construct form data
      let formData = new FormData();
      file = document.getElementById("attachment").files[0]
      hash = await sha256(file);
      const type = document.getElementById("type").value;
      const response = await axios.get("/HIP/getLatestId");
      numRequests = response.data;
      const bounty = await fee(type);

      const duration = Number(document.getElementById("duration").value) * 86400;
      // Get classes
      let classes = [];
      let numClasses = 0;
      const problemType = document.getElementById("type").value;

      if (problemType === "Sorting" || problemType === "Labelling") {
        numClasses = parseInt(document.getElementById("num-classes").value);

        // Log for debugging purposes
        console.log(`Number of classes: ${numClasses}`);
        console.log(document.getElementById(`class-short-desc-${1}`).value);
        console.log(document.getElementById(`class-short-desc-${2}`).value);

        for (let i = 1; i <= numClasses; i++) {
          classes.push({
            name: document.getElementById(`class-name-${i}`).value,
            description: document.getElementById(`class-short-desc-${i}`).value
          });
        }
      }

      formData.append("id", numRequests);
      formData.append("proposer", accounts[0]);
      formData.append("type", type);
      formData.append("title", document.getElementById("title").value);
      formData.append("description", document.getElementById("description").value);
      let fileExtension = file.name.split('.').pop();
      formData.append("file", file, numRequests + "." + fileExtension);
      formData.append("num-options", document.getElementById("num-options").value);
      let creationDate = await web3.eth.getBlock("latest");
      creationDate = creationDate.timestamp;
      formData.append("date", creationDate);
      formData.append("duration", duration);
      formData.append("bounty", bounty);
      formData.append("numClasses", numClasses);



      // Get options

      let options = [];
      console.log(numOptions);

      console.log(document.getElementById(`option-short-desc-${1}`).value);

      console.log(document.getElementById(`option-short-desc-${2}`).value);
      for (let i = 1; i <= numOptions; i++) {

        options.push({
          name: document.getElementById(`option-name-${i}`).value,
          description: document.getElementById(`option-short-desc-${i}`).value
        });
      }
      formData.append("options", JSON.stringify(options));



      formData.append("classes", JSON.stringify(classes));


      // Upload file

      let fileUploadResponse = await fetch("/upload-single-file", {
        method: "POST",
        body: formData
      });

      if (fileUploadResponse.ok) {
        // Show the animation
        // showAnimation();
        let fileData = await fileUploadResponse.json();
        let fileURL = new URL(fileData.url);
        let filePath = fileURL.pathname;

        // Construct the new URL with the current domain
        let Url = window.location.origin + '/uploads/' + filePath;


        let taskIndex = await getTaskNumber(accounts[0]);

        // Construct the data to be posted
        let data = {

          id: numRequests,
          proposer: accounts[0],
          taskIndex: taskIndex,
          title: document.getElementById("title").value,
          type: document.getElementById("type").value,
          description: document.getElementById("description").value,
          attachmentUrl: Url,
          numOptions: numOptions,
          options: options,
          classes: classes,
          date: creationDate,
          duration: duration,
          bounty: bounty,
          numResponses: 0
        };

        // Post the data to the backend
        let response = await fetch("/HIP", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          console.log("Data sent successfully");
          // Increment the task count for the proposer
          await incrementTaskCount(accounts[0]);

          let taskType;
          if (document.getElementById("type").value == "Choice") { taskType = 0; numClasses = 0 }
          else if (document.getElementById("type").value == "Ranking") { taskType = 1; numClasses = 0 }
          else if (document.getElementById("type").value == "Sorting") { taskType = 2 }
          else if (document.getElementById("type").value == "Labelling") { taskType = 3 }
          console.log("taskType:", taskType);
          console.log("numOptions:", numOptions);
          console.log("numClasses:", numClasses);
          console.log("duration:", duration);
          console.log("numHIPs:", numHIPs);

          await contract.methods
            .submitHIP(
              taskType,
              numOptions,
              numClasses,
              duration,
              numHIPs

            )
            .send({ from: accounts[0], value: bounty })
            .then(async (result) => {
              console.log(result);
              // Hide the animation
              // hideAnimation();
              await goBack();
              await refresh();

            })
            .catch(async (error) => {
              // Hide the animation
              //hideAnimation();
              console.error("Error in contract.methods.submitHIP:", error);
              await deleteRecord(numRequests);
              await decrementTaskCount(accounts[0]);

            });

        } else {
          console.error("Error sending data");
        }
      } else {
        console.error("Error uploading file");
      }
    } else {
      console.log("Missing fields");
    }


  });

  document.getElementById("btn-disconnect").addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent any default action
    await onDisconnect();
    // Update UI or do any other tasks post disconnection here
  });

});




function generateTaskInfo(i, currentBlock) {
  // Create a container for the task info
  const taskInfoContainer = document.createElement('div');






  // Add the task description
  const taskDescription = document.createElement('div');
  taskDescription.classList.add('info-item', 'uk-flex', 'uk-flex-middle', 'uk-margin-bottom');


  taskDescription.innerHTML += db[i].description;


  // Add the task type and attachment container
  const typeAndAttachment = document.createElement('div');
  typeAndAttachment.classList.add('uk-grid-small', 'uk-child-width-auto', 'uk-margin-bottom');
  typeAndAttachment.setAttribute('uk-grid', '');

  // Task Type with Icon
  const taskType = document.createElement('div');
  taskType.classList.add('info-item');
  const typeIcon = document.createElement('i');
  typeIcon.setAttribute('data-eva', 'file-text-outline');

  taskType.appendChild(typeIcon);
  taskType.innerHTML += db[i].type;
  typeAndAttachment.appendChild(taskType);

  // Attachment with Icon
  const attachment = document.createElement('div');
  attachment.classList.add('info-item', 'uk-flex', 'uk-flex-middle');
  const attachIcon = document.createElement('i');
  attachIcon.setAttribute('data-eva', 'attach-outline');

  attachment.appendChild(attachIcon);
  const downloadLink = document.createElement('a');
  downloadLink.href = db[i].attachmentUrl;
  downloadLink.classList.add('download-link');
  downloadLink.innerHTML = 'Attachment';
  downloadLink.target = "_blank";
  attachment.appendChild(downloadLink);
  typeAndAttachment.appendChild(attachment);



  // Remaining Time, Bounty Value, Number of Responses container
  const otherInfo = document.createElement('div');
  otherInfo.classList.add('uk-grid-small', 'uk-child-width-auto');
  otherInfo.setAttribute('uk-grid', '');

  // Remaining Time with Icon
  const remainingTime = document.createElement('div');
  remainingTime.classList.add('info-item', 'uk-flex', 'uk-flex-middle');
  const timeIcon = document.createElement('i');
  timeIcon.setAttribute('data-eva', 'clock-outline');

  remainingTime.appendChild(timeIcon);
  remainingTime.innerHTML += convertUnixTime(
    -parseInt(currentBlock) +
    parseInt(db[i].date) +
    parseInt(db[i].duration)
  );;
  otherInfo.appendChild(remainingTime);

  // Bounty Value with Icon
  const bounty = document.createElement('div');
  bounty.classList.add('info-item', 'uk-flex', 'uk-flex-middle');
  const bountyIcon = document.createElement('i');
  bountyIcon.setAttribute('data-eva', 'credit-card-outline');

  bounty.appendChild(bountyIcon);
  bounty.innerHTML += weiToEth(db[i].bounty) + ' ETH'
  otherInfo.appendChild(bounty);

  // Number of Responses with Icon
  const numResponses = document.createElement('div');
  numResponses.classList.add('info-item', 'uk-flex', 'uk-flex-middle');
  const responseIcon = document.createElement('i');
  responseIcon.setAttribute('data-eva', 'message-circle-outline');

  numResponses.appendChild(responseIcon);
  numResponses.innerHTML += db[i].numResponses + ' responses';
  otherInfo.appendChild(numResponses);

  taskInfoContainer.classList.add('taskInfo');
  taskInfoContainer.appendChild(taskDescription);
  taskInfoContainer.appendChild(typeAndAttachment);
  taskInfoContainer.appendChild(otherInfo);

  return taskInfoContainer;
}

function generateChoiceOptionCard(title, description, index) {
  let card = document.createElement('div');
  card.className = 'uk-card uk-card-default uk-margin';
  card.setAttribute('data-id', index);
  let cardHeader = document.createElement('div');
  cardHeader.className = 'uk-card-header uk-flex uk-flex-between uk-flex-middle uk-padding-small';

  let titleDiv = document.createElement('div');
  let choiceSpan = document.createElement('span');
  choiceSpan.className = 'choice';
  let optionTitle = document.createElement('span');
  optionTitle.className = 'option-title';
  optionTitle.textContent = title;
  titleDiv.appendChild(choiceSpan);
  titleDiv.appendChild(optionTitle);

  let dragHandle = document.createElement('div');
  dragHandle.className = 'drag-handle';
  let icon = document.createElement('i');
  icon.className = 'choice-icon';
  icon.setAttribute('data-eva', 'award-outline');

  dragHandle.appendChild(icon);

  cardHeader.appendChild(titleDiv);
  cardHeader.appendChild(dragHandle);

  let cardBody = document.createElement('div');
  cardBody.className = 'uk-card-body uk-padding-small';
  let small = document.createElement('small');
  small.textContent = description;
  cardBody.appendChild(small);

  card.appendChild(cardHeader);
  card.appendChild(cardBody);

  return card;
}

function generateChoiceDiv(i) {

  let choiceDiv = document.createElement('div');
  choiceDiv.style.background = 'var(--Choice)';
  choiceDiv.id = 'option-cards';
  choiceDiv.className = 'element uk-grid-small uk-child-width-1-1';

  // Sample ranking cards data
  let choiceOptionData = db[i].options;

  // Generate choice option cards
  for (let [index, data] of choiceOptionData.entries()) {
    let card = generateChoiceOptionCard(data.name, data.description, index);
    choiceDiv.appendChild(card);
  }

  let submitButton = document.createElement('button');
  submitButton.id = 'submit-response';
  submitButton.className = 'no-highlight btn uk-button uk-width-1- uk-button-click';
  submitButton.type = 'submit';
  submitButton.textContent = 'Submit Response';
  // Event handler for the "Submit Response" button
  submitButton.addEventListener('click', async function() {
    if (selectedCardIndex !== null) {
      //alert(`Selected card index: ${selectedCardIndex}`);
      selectedCardIndex = [parseInt(selectedCardIndex)];
      await recordResponse(i, accounts[0], selectedCardIndex, db[i].proposer, db[i].taskIndex, db[i].numResponses);
    } else {
      alert("Please choose a card before submitting.");
    }
  });
  choiceDiv.appendChild(submitButton);

  return choiceDiv;
}

function generateRankingDiv(i) {
  let rankingDiv = document.createElement('div');
  rankingDiv.style.background = 'var(--Ranking)';
  rankingDiv.id = 'option-cards';
  rankingDiv.className = 'element uk-grid-small uk-child-width-1-1';
  rankingDiv.setAttribute('uk-sortable', 'handle: .drag-handle');

  // Sample ranking cards data
  let rankingData = db[i].options;

  // Generate ranking cards
  for (let [index, data] of rankingData.entries()) {
    let card = generateRankingCard(data.name, data.description, index);
    rankingDiv.appendChild(card);
  }

  let submitButton = document.createElement('button');
  submitButton.id = 'submit-response';
  submitButton.className = 'no-highlight btn uk-button uk-width-1- uk-button-click';
  submitButton.type = 'submit';
  submitButton.textContent = 'Submit Response';
  submitButton.addEventListener('click', async function() {
    const cards = rankingDiv.querySelectorAll('.uk-card');
    const rankingOrder = [];

    cards.forEach(card => {
      const initialIndex = card.getAttribute('data-initial-index');
      rankingOrder.push(parseInt(initialIndex));
    });

    //alert(rankingOrder);
    await recordResponse(i, accounts[0], rankingOrder, db[i].proposer, db[i].taskIndex, db[i].numResponses);
  });

  rankingDiv.appendChild(submitButton);

  return rankingDiv;
}

function generateRankingCard(title, description, index) {

  let card = document.createElement('div');
  card.className = 'uk-card uk-card-default uk-margin';
  // Attach a data attribute to remember this card's initial position
  card.setAttribute('data-initial-index', index);
  let cardHeader = document.createElement('div');
  cardHeader.className = 'uk-card-header uk-flex uk-flex-between uk-flex-middle uk-padding-small';

  let titleDiv = document.createElement('div');
  let optionTitle = document.createElement('span');
  optionTitle.className = 'option-title';
  optionTitle.textContent = title;
  titleDiv.appendChild(optionTitle);

  let rankSpan = document.createElement('span');
  rankSpan.className = 'rank';

  let dragHandle = document.createElement('div');
  dragHandle.className = 'drag-handle';
  let icon = document.createElement('i');
  icon.className = 'ranking-icon';
  icon.setAttribute('data-eva', 'move-outline');
  dragHandle.appendChild(icon);

  cardHeader.appendChild(titleDiv);
  cardHeader.appendChild(rankSpan);
  cardHeader.appendChild(dragHandle);

  let cardBody = document.createElement('div');
  cardBody.className = 'uk-card-body uk-padding-small';
  let small = document.createElement('small');
  small.textContent = description;
  cardBody.appendChild(small);

  card.appendChild(cardHeader);
  card.appendChild(cardBody);

  return card;
}

function updateRankings() {
  choiceCards = document.querySelectorAll("#option-cards .uk-card");
  choiceCards.forEach((card, index) => {
    const rankingElement = card.querySelector(".rank");
    if (rankingElement) { // To ensure it's not null
      rankingElement.innerHTML = `${index + 1}`;
    }
  });
}

function generateSortingDiv(i) {
  let sortingDiv = document.createElement('div');
  sortingDiv.style.background = 'var(--Sorting)';
  sortingDiv.id = 'option-cards';
  sortingDiv.className = 'element uk-grid-small uk-child-width-1-1';

  // Sample sorting cards data
  let sortingData = db[i].options;

  // Generate sorting cards
  for (let data of sortingData) {
    let card = generateSortingCard(data.name, data.description, i);
    sortingDiv.appendChild(card);
  }

  let submitButton = document.createElement('button');
  submitButton.id = 'submit-response';
  submitButton.className = 'no-highlight btn uk-button uk-width-1- uk-button-click';
  submitButton.type = 'submit';
  submitButton.textContent = 'Submit Response';
  submitButton.addEventListener('click', async function() {
    const cards = sortingDiv.querySelectorAll('.uk-card');
    const cardClasses = [];
    let unassigned = false;
    let sortingIndex = null;
    cards.forEach(card => {
      sortingIndex = card.getAttribute('data-sorting-index');
      if (sortingIndex !== null) {
        cardClasses.push(parseInt(sortingIndex));
      } else {
        unassigned = true;

      }
    });

    if (unassigned) {
      alert('Please assign a class to all cards before submitting.');
    } else {

      await recordResponse(i, accounts[0], cardClasses, db[i].proposer, db[i].taskIndex, db[i].numResponses);

    }
  });

  sortingDiv.appendChild(submitButton);

  return sortingDiv;
}

function generateSortingCard(title, description, i) {
  let card = document.createElement('div');
  card.className = 'uk-card uk-card-default uk-margin';

  let cardHeader = document.createElement('div');
  cardHeader.className = 'uk-card-header uk-flex uk-flex-between uk-flex-middle uk-padding-small';

  let titleDiv = document.createElement('div');
  let optionTitle = document.createElement('span');
  optionTitle.className = 'option-title';
  optionTitle.textContent = title;
  titleDiv.appendChild(optionTitle);

  let sortingNameSpan = document.createElement('span');
  sortingNameSpan.className = 'sorting-name';

  let sortingHandle = document.createElement('div');
  sortingHandle.className = 'sorting-handle';
  let icon = document.createElement('i');
  icon.className = 'sorting-icon';
  icon.setAttribute('data-eva', 'keypad-outline');
  sortingHandle.appendChild(icon);

  let dropdown = document.createElement('div');
  dropdown.className = 'sorting-dropdown uk-invisible ';
  let ul = document.createElement('ul');
  let categories = db[i].classes
  categories.forEach((category, index) => {
    let li = document.createElement('li');
    li.setAttribute('data-sorting', category.name);
    li.textContent = category.name;
    li.setAttribute('data-index', index);

    let span = document.createElement('span');
    span.setAttribute('title', `${category.description}`);
    let infoIcon = document.createElement('i');
    infoIcon.setAttribute('data-eva', 'info-outline');
    span.appendChild(infoIcon);

    li.appendChild(span);
    ul.appendChild(li);
  });
  dropdown.appendChild(ul);
  sortingHandle.appendChild(dropdown);

  cardHeader.appendChild(titleDiv);
  cardHeader.appendChild(sortingNameSpan);
  cardHeader.appendChild(sortingHandle);

  let cardBody = document.createElement('div');
  cardBody.className = 'uk-card-body uk-padding-small';
  let small = document.createElement('small');
  small.textContent = description;
  cardBody.appendChild(small);

  card.appendChild(cardHeader);
  card.appendChild(cardBody);

  return card;
}

function assignSorting() {
  const sortingIcons = document.querySelectorAll('.sorting-icon');
  sortingIcons.forEach(icon => {
    const dropdown = icon.nextElementSibling;
    icon.addEventListener('click', function() {
      dropdown.classList.toggle('uk-invisible');
    });
    dropdown.addEventListener('click', function(e) {
      if (e.target && e.target.nodeName == "LI") {
        const sortingIndex = e.target.getAttribute('data-index');
        icon.parentElement.parentElement.querySelector('.sorting-name').textContent = e.target.getAttribute('data-sorting');
        icon.parentElement.parentElement.parentElement.setAttribute('data-sorting-index', sortingIndex);

        dropdown.classList.add('uk-invisible');
      }
    });


  });
}

function generateLabellingDiv(i) {
  let labellingDiv = document.createElement('div');
  labellingDiv.style.background = 'var(--Labelling)';
  labellingDiv.id = 'option-cards';
  labellingDiv.className = 'element uk-grid-small uk-child-width-1-1';

  // Sample labelling cards data
  let labellingData = db[i].options;

  // Generate labelling cards
  for (let data of labellingData) {
    let card = generateLabellingCard(data.name, data.description, i);
    labellingDiv.appendChild(card);
  }

  let submitButton = document.createElement('button');
  submitButton.id = 'submit-response';
  submitButton.className = 'no-highlight btn uk-button uk-width-1- uk-button-click';
  submitButton.type = 'submit';
  submitButton.textContent = 'Submit Response';
  submitButton.addEventListener('click', async function() {
    const cards = document.querySelectorAll("#option-cards .uk-card");
    const labelsArray = [];
    let allLabeled = true;
    cards.forEach(card => {
      const labelIndex = card.getAttribute('data-label-index');
      if (labelIndex === null) {
        allLabeled = false;
      } else {
        labelsArray.push(parseInt(labelIndex));

      }
    });

    if (!allLabeled) {
      alert('Please label all the cards.');
    } else {


      await recordResponse(i, accounts[0], labelsArray, db[i].proposer, db[i].taskIndex, db[i].numResponses);
    }
  });

  labellingDiv.appendChild(submitButton);

  return labellingDiv;
}

function generateLabellingCard(title, description, i) {
  let card = document.createElement('div');
  card.className = 'uk-card uk-card-default uk-margin';

  let cardHeader = document.createElement('div');
  cardHeader.className = 'uk-card-header uk-flex uk-flex-between uk-flex-middle uk-padding-small';

  let titleDiv = document.createElement('div');
  let optionTitle = document.createElement('span');
  optionTitle.className = 'option-title';
  optionTitle.textContent = title;
  titleDiv.appendChild(optionTitle);

  let labelNameSpan = document.createElement('span');
  labelNameSpan.className = 'label-name';

  let labelHandle = document.createElement('div');
  labelHandle.className = 'sorting-handle';
  let icon = document.createElement('i');
  icon.className = 'label-icon';
  icon.setAttribute('data-eva', 'pricetags-outline');
  labelHandle.appendChild(icon);

  let dropdown = document.createElement('div');
  dropdown.className = 'label-dropdown uk-invisible uk-flex-left uk-padding-small';
  let ul = document.createElement('ul');
  let categories = db[i].classes;
  categories.forEach((category, index) => {
    let li = document.createElement('li');
    li.setAttribute('data-label-index', index);
    li.setAttribute('data-label', category.name);
    li.textContent = category.name;

    let span = document.createElement('span');
    span.setAttribute('title', ` ${category.description}`);
    let infoIcon = document.createElement('i');
    infoIcon.setAttribute('data-eva', 'info-outline');
    span.appendChild(infoIcon);

    li.appendChild(span);
    ul.appendChild(li);
  });
  dropdown.appendChild(ul);
  labelHandle.appendChild(dropdown);

  cardHeader.appendChild(titleDiv);
  cardHeader.appendChild(labelNameSpan);
  cardHeader.appendChild(labelHandle);

  let cardBody = document.createElement('div');
  cardBody.className = 'uk-card-body uk-padding-small';
  let small = document.createElement('small');
  small.textContent = description;
  cardBody.appendChild(small);

  card.appendChild(cardHeader);
  card.appendChild(cardBody);

  return card;
}

function assignLabel() {
  const labelIcons = document.querySelectorAll('.label-icon');
  labelIcons.forEach(icon => {
    const dropdown = icon.nextElementSibling;
    icon.addEventListener('click', function() {
      dropdown.classList.toggle('uk-invisible');
    });
    dropdown.addEventListener('click', function(e) {
      if (e.target && e.target.nodeName == "LI") {
        const labelIndex = e.target.getAttribute('data-label-index');
        const grandParent = icon.parentElement.parentElement.parentElement;
        grandParent.setAttribute('data-label-index', labelIndex);

        icon.parentElement.parentElement.querySelector('.label-name').textContent = e.target.getAttribute('data-label');
        dropdown.classList.add('uk-invisible');
      }
    });


  });
}

async function goBack() {



  // Reappear the app div
  document.getElementById('app').style.display = initialDisplay;
  document.querySelector('#yourResponses').style.display = 'none';
  document.querySelector('#yourTasks').style.display = 'none';
  // Respond div slides right to disappear
  var respondDiv = document.getElementById('respond');
  respondDiv.style.transform = 'translateX(100%)';
  setTimeout(function() {
    respondDiv.style.display = 'none';
  }, 300);

  // Submit div slides down to disappear
  var submitDiv = document.getElementById('submit');
  submitDiv.style.transform = 'translateY(100%)';
  setTimeout(function() {
    submitDiv.style.display = 'none';
  }, 300);

}


async function getReviewerCount(address) {
  try {
    const response = await axios.get(`/HIP/getReviewerCount/${address}`);
    return parseInt(response.data.responseCount, 10);
  } catch (error) {
    console.error("Error fetching reviewer count:", error);
    return -1; // Error case
  }
}

async function incrementReviewerCount(address) {
  try {
    await axios.put("/HIP/incrementReviewerCount", { address: address });
    console.log("Incremented reviewer count successfully");
  } catch (error) {
    console.error("Error incrementing reviewer count:", error);
  }
}

async function recordResponse(taskId, respondentAddress, responseData, proposer, taskNum, responseNum) {
  try {
    // 1. Post the response to the /REVIEW route
    const reviewResponse = await axios.post("/REVIEW", {
      taskId: taskId,
      respondent: respondentAddress,
      response: responseData
    });

    if (reviewResponse.status === 200) {
      console.log("Response recorded successfully");

      // 2. Increment the numResponses of the task
      const incrementResponse = await axios.put("/HIP/incrementNumReviews", {
        id: taskId
      });
      if (incrementResponse.status === 200) {
        console.log("Number of responses incremented successfully");
      } else {
        console.error("Failed to increment the number of responses");
      }

      // 3. Increment the respondent's count
      await incrementReviewerCount(respondentAddress);
      //4. Writing response in contract 

      await contract.methods
        .submitResponse(
          proposer,
          parseInt(taskNum),
          responseData
        )
        .send({ from: accounts[0] })
        .then(async (result) => {
          console.log(result);
          // Hide the animation
          // hideAnimation();
          await goBack();
          await refresh();

        })
        .catch((error) => {
          // Hide the animation
          //hideAnimation();
          console.error("Error in contract.methods.submitResponse:", error);
          deleteResponse(taskId)

        });

    } else {
      console.error("Failed to record the response");
    }
  } catch (error) {
    console.error("Error in recordResponse function:", error);
  }
}


//Deleting a database record
async function deleteRecord(id) {
  try {
    const response = await axios.delete(`/HIP/${id}`);
    console.log(response.data);
  } catch (error) {
    console.error("Error in axios.delete:", error);
  }
}

// Deleting a response
async function deleteResponse(taskId) {
  try {
    const response = await axios.delete(`/REVIEW/${taskId}/${accounts[0]}`);
    console.log(response.data);
    await axios.put("/HIP/decrementNumReviews", { id: taskId });
    await axios.put("/HIP/decrementReviewerCount", { address: accounts[0] });

  } catch (error) {
    console.error("Error in axios.delete:", error);
  }
}


const ethToWei = (eth) => {
  const weiPerEth = BigInt("1000000000000000000"); // 10^18
  return (BigInt(eth) * weiPerEth).toString();
}

const weiToEth = (wei) => {
  const weiPerEth = 1000000000000000000; // 10^18
  return (wei / weiPerEth).toString();
}

//Function to set the fee of each problem type
async function fee(type) {
  let i;
  if (type == "Choice") { i = 0; }
  else if (type == "Ranking") { i = 1; }
  else if (type == "Sorting") { i = 2; }
  else if (type == "Labelling") { i = 3; }

  try {
    const fee = await contract.methods.getFee(i).call();
    console.log(`Fee for index ${i} is: ${fee}`);
    return fee;
  } catch (error) {
    console.error("Error fetching fee:", error);
  }

}

async function incrementTaskCount(address) {
  try {
    const response = await fetch("/HIP/incrementProposerCount", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ address: address })
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log("Task count incremented:", responseData);
    } else {
      console.error("Error incrementing task count:", await response.text());
    }
  } catch (error) {

  }
}

async function decrementTaskCount(address) {
  try {
    const response = await fetch("/HIP/decrementProposerCount", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ address: address })
    });

    if (response.ok) {
      const responseData = await response.json();

    } else {

    }
  } catch (error) {

  }
}



async function getTaskNumber(address) {
  try {
    const response = await fetch(`/HIP/getProposerTaskCount/${address}`);

    if (response.ok) {
      const responseData = await response.json(); // Parse the response as JSON
      const taskCount = parseInt(responseData.taskCount, 10); // Convert the string to a number
      console.log("Task count fetched:", taskCount);
      return taskCount;
    } else {
      console.error("Error fetching task count:", await response.text());
      return null;
    }

  } catch (error) {
    console.error("Error in getTaskNumber:", error);
    return null;
  }
}

//Your tasks link
const yourTasksTrigger = document.querySelector('.your-tasks-trigger');
const yourTasksElement = document.querySelector('#yourTasks');

yourTasksTrigger.addEventListener('click', async function() {
  document.getElementsByClassName("loader")[1].style.display = "flex";
  const isConnected = await checkWalletConnection();

  if (isConnected) {
    // Check if the element is already displayed
    if (yourTasksElement.style.display === "block") {
      document.getElementsByClassName("loader")[1].style.display = "none";
      return;
    } else {
      // Array of element IDs to check for visibility
      const elementIds = ['app', 'respond', 'submit', 'yourResponses'];

      elementIds.forEach(id => {
        const element = document.getElementById(id);

        // Check if the element is currently visible
        if (element && element.style.display !== "none") {
          // Hide the element
          element.style.display = "none";
        }
      });
      // Show the element
      yourTasksElement.style.display = "block";
      setTimeout(() => {
        yourTasksElement.style.transform = "translateY(0%)";
      }, 0); // Timeout needed to allow the browser to first apply the display property change
      //Retrieve all tasks
      yourTasks = await fetchTasksByAddress(accounts[0]);

      yourNumHIPS = yourTasks.length;
      if (yourNumHIPS == 0) {
        alert('You have not initiated any tasks.');
        await goBack();
        return;
      }
      let yourHIPCount = 0;
      yourTasksBoard = document.getElementById("yourTasksboard");
      yourTasksBoard.innerHTML = "";
      for (var i = yourNumHIPS - 1; i >= 0; i--) {
        yourHIPCount++;
        // Create the main li element
        let li = document.createElement('li');
        li.id = i;
        let taskType = yourTasks[i].type.toLowerCase();
        li.className = taskType + '-card';
        li.setAttribute('data-tags', yourTasks[i].title);

        // Create the anchor element
        let anchor = document.createElement('a');
        anchor.id = i;
        anchor.className = 'view';
        // Content div
        let contentDiv = document.createElement('div');
        contentDiv.className = 'content';

        // Export button
        let exportButton = document.createElement('button');
        exportButton.textContent = 'Export responses';
        exportButton.classList.add('uk-button', 'uk-button-default', 'uk-button-small', 'uk-margin-small-top');


        // Icon div inside the content
        let iconDiv = document.createElement('div');
        iconDiv.className = 'icon';
        let icon = document.createElement('i');
        if (taskType == "choice") {
          icon.setAttribute('data-eva', 'award-outline');
          exportButton.style.color = "var(--primary-1)";
          exportButton.style.borderColor = "var(--primary-1)";




        }
        else if (taskType == "ranking") {
          icon.setAttribute('data-eva', 'bar-chart-2-outline');
          li.style.setProperty("--color", "var(--primary-2)");
          exportButton.style.color = "var(--primary-2)";
          exportButton.style.borderColor = "var(--primary-2)";
        }
        if (taskType == "sorting") {
          icon.setAttribute('data-eva', 'keypad-outline');
          li.style.setProperty("--color", "var(--primary-3)");
          exportButton.style.color = "var(--primary-3)";
          exportButton.style.borderColor = "var(--primary-3)";
        }
        if (taskType == "labelling") {
          icon.setAttribute('data-eva', 'pricetags-outline');
          li.style.setProperty("--color", "var(--primary-4)");
          exportButton.style.color = "var(--primary-4)";
          exportButton.style.borderColor = "var(--primary-4)";

        }
        iconDiv.appendChild(icon);

        // Text div inside the content
        let textDiv = document.createElement('div');
        textDiv.className = 'text';
        // Add title
        textDiv.appendChild(document.createTextNode(yourTasks[i].title));

        // Create description
        const span = document.createElement('span');
        span.className = 'type-' + taskType;
        span.innerText = taskType.toUpperCase();
        textDiv.appendChild(span);

        // Create the small element and add it to the div
        const small = document.createElement('small');
        small.innerText = yourTasks[i].description
        textDiv.appendChild(small);

        //Compute remaining time
        let currentBlock;
        let timeLeft;
        // Get the latest block details
        if (web3.currentProvider) {
          currentBlock = await web3.eth.getBlock("latest");

          if (typeof currentBlock === "undefined") {
            timeLeft = "Unknown";
          } else {
            currentBlock = currentBlock.timestamp;

            timeLeft =

              convertUnixTime(
                -parseInt(currentBlock) +
                parseInt(yourTasks[i].date) +
                parseInt(yourTasks[i].duration)
              );
          }
        } else {
          timeLeft = " No wallet";
        }



        // Append icon and text div to content
        contentDiv.appendChild(iconDiv);
        contentDiv.appendChild(textDiv);




        // Append content
        anchor.appendChild(contentDiv);
        //Logic of the export button
        const taskId = yourTasks[i].id;
        ((taskId) => {
          exportButton.addEventListener('click', async () => {
            const response = await fetch(`/getResponses/${taskId}`);
            const data = await response.json();

            if (data.length === 0) {
              alert("This task has not received any response.");
            } else {
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.style.display = 'none';
              a.href = url;
              a.download = `responses_task_${taskId}.json`;

              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
            }
          });
        })(yourTasks[i].id);


        //append export button


        anchor.appendChild(exportButton);

        // Append anchor to li
        li.appendChild(anchor);

        yourTasksBoard.appendChild(li);
        document.getElementsByClassName("loader")[1].style.display = "none";
        eva.replace();
      }
    }
  }
});

//Your Responses link 
// Your responses link
const yourResponsesTrigger = document.querySelector('.your-responses-trigger');
const yourResponsesElement = document.querySelector('#yourResponses');

yourResponsesTrigger.addEventListener('click', async function() {
  document.getElementsByClassName("loader")[2].style.display = "flex";
  const isConnected = await checkWalletConnection();

  if (isConnected) {
    // Check if the element is already displayed
    if (yourResponsesElement.style.display === "block") {
      document.getElementsByClassName("loader")[2].style.display = "none";
      return;
    } else {
      // Array of element IDs to check for visibility
      const elementIds = ['app', 'respond', 'submit', 'yourTasks'];

      elementIds.forEach(id => {
        const element = document.getElementById(id);

        // Check if the element is currently visible
        if (element && element.style.display !== "none") {
          // Hide the element
          element.style.display = "none";
        }
      });

      // Show the element
      yourResponsesElement.style.display = "block";
      setTimeout(() => {
        yourResponsesElement.style.transform = "translateY(0%)";
      }, 0); // Timeout needed to allow the browser to first apply the display property change
      yourTasks = await fetchTasksRespondedToByAddress(accounts[0]);
      yourNumHIPS = yourTasks.length;
      if (yourNumHIPS == 0) {
        alert('You have not responded to any tasks.');
        await goBack();
        return;
      }
      yourHIPCount = 0;
      yourTasksBoard = document.getElementById("yourResponsesboard");
      yourTasksBoard.innerHTML = "";
      for (var i = yourNumHIPS - 1; i >= 0; i--) {
        yourHIPCount++;
        // Create the main li element
        let li = document.createElement('li');
        li.id = i;
        let taskType = yourTasks[i].type.toLowerCase();
        li.className = taskType + '-card';
        li.setAttribute('data-tags', yourTasks[i].title);

        // Create the anchor element
        let anchor = document.createElement('a');
        anchor.id = i;
        anchor.className = 'view';
        // Content div
        let contentDiv = document.createElement('div');
        contentDiv.className = 'content';

        // Export button
        let paymentButton = document.createElement('button');
        paymentButton.textContent = 'Request Payment';
        paymentButton.classList.add('uk-button', 'uk-button-default', 'uk-button-small', 'uk-margin-small-top');

        paymentButton.addEventListener('click', async () => {
          try {
            const result = await contract.methods.requestPayment().send({ from: accounts[0] });
            console.log(result);
            // You can add more actions here, such as refreshing the UI or notifying the user of success
          } catch (error) {
            console.error("Error in contract.methods.requestPayment:", error);
            // Handle the error, perhaps by notifying the user
          }
        });
        // Icon div inside the content
        let iconDiv = document.createElement('div');
        iconDiv.className = 'icon';
        let icon = document.createElement('i');
        if (taskType == "choice") {
          icon.setAttribute('data-eva', 'award-outline');
          exportButton.style.color = "var(--primary-1)";
          exportButton.style.borderColor = "var(--primary-1)";




        }
        else if (taskType == "ranking") {
          icon.setAttribute('data-eva', 'bar-chart-2-outline');
          li.style.setProperty("--color", "var(--primary-2)");
          paymentButton.style.color = "var(--primary-2)";
          paymentButton.style.borderColor = "var(--primary-2)";
        }
        if (taskType == "sorting") {
          icon.setAttribute('data-eva', 'keypad-outline');
          li.style.setProperty("--color", "var(--primary-3)");
          paymentButton.style.color = "var(--primary-3)";
          paymentButton.style.borderColor = "var(--primary-3)";
        }
        if (taskType == "labelling") {
          icon.setAttribute('data-eva', 'pricetags-outline');
          li.style.setProperty("--color", "var(--primary-4)");
          paymentButton.style.color = "var(--primary-4)";
          paymentButton.style.borderColor = "var(--primary-4)";

        }
        iconDiv.appendChild(icon);

        // Text div inside the content
        let textDiv = document.createElement('div');
        textDiv.className = 'text';
        // Add title
        textDiv.appendChild(document.createTextNode(yourTasks[i].title));

        // Create description
        const span = document.createElement('span');
        span.className = 'type-' + taskType;
        span.innerText = taskType.toUpperCase();
        textDiv.appendChild(span);

        // Create the small element and add it to the div
        const small = document.createElement('small');
        small.innerText = yourTasks[i].description
        textDiv.appendChild(small);

        //Compute remaining time
        let currentBlock;
        let timeLeft;
        // Get the latest block details
        if (web3.currentProvider) {
          currentBlock = await web3.eth.getBlock("latest");

          if (typeof currentBlock === "undefined") {
            timeLeft = "Unknown";
          } else {
            currentBlock = currentBlock.timestamp;

            timeLeft =

              convertUnixTime(
                -parseInt(currentBlock) +
                parseInt(yourTasks[i].date) +
                parseInt(yourTasks[i].duration)
              );
          }
        } else {
          timeLeft = " No wallet";
        }



        // Append icon and text div to content
        contentDiv.appendChild(iconDiv);
        contentDiv.appendChild(textDiv);




        // Append content
        anchor.appendChild(contentDiv);
        //Logic of the export button
        const taskId = yourTasks[i].id;
        ((taskId) => {
          paymentButton.addEventListener('click', async () => {
            alert('This is where we make a call to the contract')
          });
        })(yourTasks[i].id);


        //append export button


        anchor.appendChild(paymentButton);

        // Append anchor to li
        li.appendChild(anchor);

        yourTasksBoard.appendChild(li);
        document.getElementsByClassName("loader")[2].style.display = "none";
        eva.replace();
      }

    }
  }
});

//Fetch tasks created by address
async function fetchTasksByAddress(address) {
  try {

    const response = await fetch(`/HIP/getTasksByAddress/${address}`);
    if (response.status !== 200) {

      throw new Error("Failed to fetch tasks");
    }
    const tasks = await response.json();

    return tasks;
  } catch (error) {
    console.error(error);
    return [];
  }
}

//Fetch tasks responded to by address
async function fetchTasksRespondedToByAddress(address) {
  try {
    const response = await fetch(`/getTasksByResponder/${address}`);
    if (response.status !== 200) {
      throw new Error("Failed to fetch tasks");
    }
    const tasks = await response.json();
    return tasks;
  } catch (error) {
    console.error(error);
    return [];
  }
}
