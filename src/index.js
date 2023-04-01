import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { createMarkup } from './gallery-card-markup.js';
import { PixabayApi } from './pixabay-api';
let throttle = require('lodash.throttle');
let debounce = require('lodash.debounce');

const SLBoptions = {
  enableKeyboard: true,
  docClose: true,
  doubleTapZoom: 2,
  scrollZoom: true,
  preloading: true,
  animationSpeed: 200,
  animationSlide: true,
  loadingTimeout: 10,
  transitionIn: 'none',
  transitionOut: 'none',
  // showCounter: false,
};

Notiflix.Notify.init({
  width: '300px',
  position: 'left-top',
  closeButton: false,
  distance: '20px	',
  timeout: 1000,
});

let gallery = new SimpleLightbox('.photo-card', SLBoptions);

const pixabayApi = new PixabayApi();

const refs = {
  gallery: document.querySelector('.gallery'),
  form: document.querySelector('.search-form'),
  spinner: document.querySelector('.lds-dual-ring '),
  loadMoreBtn: document.querySelector('.load-more'),
  arrowDawn: document.querySelector('.arrow-down'),
  arrowUp: document.querySelector('.arrow-up'),
};

const inputEl = refs.form.elements[0];
let imageCounter = 0;
let searchQue = null;

refs.form.addEventListener('submit', e => {
  e.preventDefault();
  refs.spinner.style.opacity = 1;
  try {
    if (inputEl.value !== '') {
      getImages(inputEl.value).then(() => {
        refs.spinner.style.opacity = 0;
        searchQue = inputEl.value;
      });
    } else {
      Notiflix.Notify.warning(`The search tab cannot be empty`);
      clearAll();
    }
  } catch {
    refs.spinner.style.opacity = 0;
    Notiflix.Notify.failure('Ooops, Something went wrong');
    // refs.loadMoreBtn.style.display = 'none';
  }
});

async function getImages(query) {
  if (query === null || query === undefined) {
    return;
  }
  return await pixabayApi
    .fetch(query)
    .then(data => {
      console.log('fetching Get');
      if (data.totalHits !== 0) {
        imageCounter += data.hits.length;

        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
        return data.hits;
      } else {
        Notiflix.Notify.info(`Sorry! We can't find any images. at your request. Please try again`);
        clearAll();
      }
    })
    .then(images => {
      if (images === undefined) {
        return;
      } else if (images !== undefined || images.length !== 0) {
        const markup = images.map(createMarkup);
        refs.gallery.innerHTML = markup.join('');
          gallery.on('show.simplelightbox');
          if (document.querySelector('.photo-card')) {
            smoothScroll()
          }
        window.addEventListener('scroll', debounce(onScroll, 500));
      }
    });
}

async function onScroll() {
  let items = document.querySelectorAll('.gallery a');
  if (window.scrollY < 200) {
    refs.arrowDawn.style.opacity = 0;
    refs.arrowUp.style.opacity = 0;
    refs.arrowDawn.style.display = 'none';
    refs.arrowUp.style.display = 'none';
  } else if (items.length > 3) {
    refs.arrowDawn.style.display = 'block';
    refs.arrowUp.style.display = 'block';
    refs.arrowDawn.style.opacity = 1;
    refs.arrowUp.style.opacity = 1;
  }
  const threshold = document.body.offsetHeight - window.innerHeight / 4;
  const position = window.scrollY + window.innerHeight;

  if (position >= threshold) {
    await infiniteLoading(searchQue);
  }
}

function clearAll() {
  refs.spinner.style.opacity = 0;
  refs.loadMoreBtn.style.display = 'none';
  refs.gallery.innerHTML = '';
}

function smoothScroll() {
  const { height: cardHeight } = document.querySelector('.gallery').firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2.5,
    behavior: 'smooth',
  });
}

function smoothScrollArrow() {
  refs.arrowDawn.style.opacity = 1;
  refs.arrowUp.style.opacity = 1;
  refs.arrowDawn.addEventListener('click', () => {
    const { height: cardHeight } = document.querySelector('.gallery').firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2.5,
      behavior: 'smooth',
    });
  });
  refs.arrowUp.addEventListener('click', () => {
    document.documentElement.scrollTop = 0;
  });
}

function infiniteLoading(query) {
  pixabayApi.page += 1;
  console.log('fetching infinite');
  pixabayApi.fetch(query).then(data => {
    refs.arrowDawn.style.display = 'block';
    refs.arrowUp.style.display = 'block';
    imageCounter += data.hits.length;

    if (data.hits.length === 0) {
      Notiflix.Notify.info(`We're sorry, but you've reached the end of search results.`);

    }
    refs.gallery.insertAdjacentHTML('beforeEnd', data.hits.map(createMarkup).join(''));
    gallery.refresh();
    smoothScrollArrow();
  });
}
