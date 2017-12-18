// const axios = require('axios');
import axios from 'axios';
import dompurify from 'dompurify';

function searchResultsHTML(stores) {
  return stores.map(store => {
    return `
      <a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>
    `;
  }).join('');
}

function typeAhead(search) {
  if (!search) {
    return;
  }

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');

  searchInput.on('input', function() {
    if (!this.value) {
      searchResults.style.display = 'none';
      return; // stop query
    }

    // display results element and make search api request
    searchResults.style.display = 'block';
    // searchRresults.innerHTML = '';

    axios
    .get(`/api/v1/search?q=${this.value}`)
    .then(res => {
      console.log('data', res.data);
      if (res.data.length) {
        // const html = searchResultsHTML(res.data);
        searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data));
        return;
      }

      // no results; inform user
      searchResults.innerHTML = dompurify.sanitize(`
        <div class="search__result">
          No results for ${this.value} found!
        </div>
      `);
    })
    .catch(err => {
      console.error('ruhroh', err);
    });
  });

  // handle keyboard input
  searchInput.on('keyup/', (e) => {
    const keycode = e.keycode;

    // if they arent pressing up down or enter, ignore
    if (![38, 40, 13].includes(keycode)) {
      return;
    }

    const activeClass = 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll('.search__result');
    let next;

    if (e.keycode === 40 && current) {
      next = current.nextElementSibling || items[0];
    } else if (keycode === 40) {
      next = items[0];
    } else if (keycode === 38 && current) {
      next = current.previousElementSibling || items[items.length -1];
    } else if (keycode === 38) {
      next = items[items.length - 1];
    } else if (keycode === 13 && current.href) {
      window.location = current.href;
      return;
    }

    if (current) {
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);
  }); 
}

export default typeAhead;
