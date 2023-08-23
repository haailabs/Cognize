document.addEventListener("DOMContentLoaded", function() {
  eva.replace();
});
const util = UIkit.util;
const search = util.$('.search-fld');
const searchVal = util.$('.search-filter');
const searchValAll = util.$('.search-filter-all');
const searchValNone = util.$('.search-filter-none');
const filterBtn = util.$$('li[data-uk-filter-control] a');
const formEl = util.$('#search-form');
let debounce, searchTerm, value;


// when write on field
util.on(search, 'keyup', () => {
  clearTimeout(debounce);

  debounce = setTimeout(() => {
    // get input value and convert to lower case
    value = search.value.toLowerCase();

    if (value.length) {
      searchTerm = '[data-tags*="' + value + '"]';
      util.attr(searchVal, 'data-uk-filter-control', searchTerm);
      // click on hidden link that gives 0 results, allow to click again filter link
      searchValNone.click();
      // click hidden link that filter the search
      searchVal.click();
    } else {
      // if search field is empty
      searchTerm = '[data-tags*=""]';
      // empty attribute
      util.attr(searchVal, 'data-uk-filter-control', searchTerm);
      // click hidden show all link
      searchValAll.click();
    }
  }, 300);
});

// prevent send form on press enter
util.on(formEl, 'keypress', e => {
  const key = e.charCode || e.keyCode || 0;
  if (key == 13) {
    e.preventDefault();
    console.log('Prevent submit on press enter');
  }
});

// empty field and attribute on click filter button
util.on(filterBtn, 'click', () => {
  if (search.value.length) {
    // empty field
    search.value = '';
    searchTerm = '[data-tags*=""]';
    // empty attribute
    util.attr(searchVal, 'data-uk-filter-control', searchTerm);
    console.log('empty field and attribute');
  }
});

util.on(searchValNone, 'click', e => {
  e.preventDefault();
})
//Filter Choice
document.addEventListener('DOMContentLoaded', function() {
  var toggleChoice = document.getElementById('toggleChoice');

  toggleChoice.addEventListener('change', function() {
    var choiceCards = document.querySelectorAll('.choice-card');
    choiceCards.forEach(function(card) {
      if (card.style.display === '' || card.style.display === 'block') {
        card.style.display = 'none';
      } else {
        card.style.display = 'block';
      }
    });
  });
});

//Filter Ranking
document.addEventListener('DOMContentLoaded', function() {
  var toggleRanking = document.getElementById('toggleRanking');

  toggleRanking.addEventListener('change', function() {
    var rankingCards = document.querySelectorAll('.ranking-card');
    rankingCards.forEach(function(card) {
      if (card.style.display === '' || card.style.display === 'block') {
        card.style.display = 'none';
      } else {
        card.style.display = 'block';
      }
    });
  });
});

//Filter Sorting
document.addEventListener('DOMContentLoaded', function() {
  var toggleSorting = document.getElementById('toggleSorting');

  toggleSorting.addEventListener('change', function() {
    var sortingCards = document.querySelectorAll('.sorting-card');
    sortingCards.forEach(function(card) {
      if (card.style.display === '' || card.style.display === 'block') {
        card.style.display = 'none';
      } else {
        card.style.display = 'block';
      }
    });
  });
});

//Filter Labelling
document.addEventListener('DOMContentLoaded', function() {
  var toggleLabelling = document.getElementById('toggleLabelling');

  toggleLabelling.addEventListener('change', function() {
    var labellingCards = document.querySelectorAll('.labelling-card');
    labellingCards.forEach(function(card) {
      if (card.style.display === '' || card.style.display === 'block') {
        card.style.display = 'none';
      } else {
        card.style.display = 'block';
      }
    });
  });
});





//Tabs to input options
function generateTabs(number) {
  const tabs = document.getElementById('option-tabs');
  const content = document.getElementById('option-tab-content');

  // Clear previous tabs & content
  tabs.innerHTML = '';
  content.innerHTML = '';

  for (let i = 0; i < number; i++) {
    // Add tab
    const tab = document.createElement('li');
    const tabLink = document.createElement('a');
    tabLink.href = "#";
    tabLink.textContent = `Option ${i + 1}`;
    tab.appendChild(tabLink);
    tabs.appendChild(tab);

    // Add tab content
    const contentItem = document.createElement('li');
    contentItem.innerHTML = `
            <div class="uk-margin">
                <label class="uk-form-label" for="option-name-${i + 1}">Name:</label>
                <input class="uk-input" id="option-name-${i + 1}" type="text" placeholder="Option Name">
            </div>
            <div class="uk-margin">
                <label class="uk-form-label" for="option-short-desc-${i + 1}">Description:</label>
                <textarea class="uk-textarea" id="option-short-desc-${i + 1}" placeholder="Description"></textarea>
            </div>
            
    
        `;
    content.appendChild(contentItem);
  }

  // Reinitialize UIKit components
  UIkit.tab(tabs);
}
//Return button
document.addEventListener("DOMContentLoaded", initialize());


document.getElementById("type").addEventListener("change", function() {
  const selectedType = this.value;
  const newTaskDiv = document.getElementById("newTask");
  newTaskDiv.style.backgroundColor = `var(--${selectedType})`;
  const classCountContainer = document.getElementById('class-count-container');
  const tabs = document.getElementById('class-tabs');
  const content = document.getElementById('class-tab-content');

  if (selectedType === "Sorting" || selectedType === "Labelling") {
    classCountContainer.style.display = "block";
  } else {
    classCountContainer.style.display = "none";

    // Clear the tabs and content
    tabs.innerHTML = '';
    content.innerHTML = '';
  }
});


document.getElementById("num-classes").addEventListener("change", function() {
  generateClassTabs(parseInt(this.value));
});

function generateClassTabs(number) {
  const tabs = document.getElementById('class-tabs'); // Assuming you've a separate ul for class tabs
  const content = document.getElementById('class-tab-content'); // Assuming you've a separate ul for class content

  // Clear previous tabs & content
  tabs.innerHTML = '';
  content.innerHTML = '';

  for (let i = 0; i < number; i++) {
    // Add tab
    const tab = document.createElement('li');
    const tabLink = document.createElement('a');
    tabLink.href = "#";
    tabLink.textContent = `Class ${i + 1}`;
    tab.appendChild(tabLink);
    tabs.appendChild(tab);

    // Add tab content
    const contentItem = document.createElement('li');
    contentItem.innerHTML = `
            <div class="uk-margin">
                <label class="uk-form-label" for="class-name-${i + 1}">Name:</label>
                <input class="uk-input" id="class-name-${i + 1}" type="text" placeholder="Class Name">
            </div>
            <div class="uk-margin">
                <label class="uk-form-label" for="class-short-desc-${i + 1}">Description:</label>
                <textarea class="uk-textarea" id="class-short-desc-${i + 1}" placeholder="Description"></textarea>
            </div>
        `;
    content.appendChild(contentItem);
  }
  UIkit.tab(tabs);
}

async function initialize() {
  let initialDisplay = document.getElementById('app').style.display;
  document.querySelector('.return').addEventListener('click', function(e) {
    e.preventDefault();

    // Reappear the app div
    document.getElementById('app').style.display = initialDisplay;

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
  });
}















