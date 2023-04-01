
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { createMarkup } from './gallery-card-markup.js';
import { PixabayApi } from './pixabay-api';
let throttle = require('lodash.throttle');

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
      if (data.totalHits !== 0) {
        imageCounter += data.hits.length;

        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      } else if (pixabayApi.page === data.totalHits) {
        Notiflix.Notify.info(
          `We're sorry, but you've reached the end of search results.`
        );
      } else {
        Notiflix.Notify.info(
          `Sorry! We can't find any images. at your request. Please try again`
        );
        clearAll();
        return;
      }
      return data.hits;
    })
    .then(images => {
      /* 
      //load more button functions
      if (images.length < 9) {
         refs.loadMoreBtn.style.display = 'none';
      } else {
        refs.loadMoreBtn.style.display = 'block';
      }
      */
      if (images !== undefined) {
        const markup = images.map(createMarkup);
        refs.gallery.innerHTML = markup.join('');
        smoothScroll();
         gallery.on('show.simplelightbox');
      }

      // loadMoreImages(query);
      window.addEventListener('scroll', throttle(onScroll, 150));
    })
}

function clearAll() {
  refs.spinner.style.opacity = 0;
  refs.loadMoreBtn.style.display = 'none';
  refs.gallery.innerHTML = '';
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 3.2,
    behavior: 'smooth',
  });
}

function smoothScrollArrow() {
  refs.arrowDawn.style.opacity = 1;
  refs.arrowDawn.addEventListener('click', () => {
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 3.2,
      behavior: 'smooth',
    });
  });
  refs.arrowUp.addEventListener('click', () => {
    document.documentElement.scrollTop = 0;
    // addSimpleLightBox().destroy();
    // setTimeout(addSimpleLightBox(), 300);
  });
}

function infiniteLoading(query) {
  pixabayApi.page += 1;
  pixabayApi
    .fetch(query)
    .then(data => {
      refs.arrowDawn.style.display = 'block';
      refs.arrowUp.style.display = 'block';
      imageCounter += data.hits.length;

      refs.gallery.insertAdjacentHTML(
        'beforeEnd',
        data.hits.map(createMarkup).join('')
      );

      if (imageCounter === data.totalHits) {
        Notiflix.Notify.info(
          `We're sorry, but you've reached the end of search results.`
        );
        refs.loadMoreBtn.style.display = 'none';
        refs.arrowDawn.style.display = 'none';
        refs.arrowUp.style.display = 'none';
      }

      smoothScrollArrow();
    })
    .finally(() => {
     gallery.refresh()

    });;
}
async function onScroll() {
  let items = document.querySelectorAll('.gallery a');
  if (window.scrollY < 200) {
    refs.arrowDawn.style.opacity = 0;
    refs.arrowUp.style.opacity = 0;
  } else if (items.length > 9) {
    refs.arrowDawn.style.opacity = 1;
    refs.arrowUp.style.opacity = 1;
  }
  let currentViewHeight =
    refs.gallery.scrollHeight - document.documentElement.scrollTop - 788;
  if (currentViewHeight <= 40) {
    await infiniteLoading(searchQue);
  }
}
// function loadMoreImages(query) {
//   refs.loadMoreBtn.addEventListener('click', () => {
//     pixabayApi.page += 1;
//     pixabayApi.fetch(query).then(data => {
//       // console.log(data);
//       refs.arrowDawn.style.display = 'block';
//       refs.arrowUp.style.display = 'block';
//       imageCounter += data.hits.length;
//       refs.gallery.insertAdjacentHTML(
//         'beforeEnd',
//         data.hits.map(createMarkup).join('')
//       );
//       addSimpleLightBox().refresh();
//       smoothScrollArrow();
//       if (imageCounter === data.totalHits) {
//         Notiflix.Notify.info(
//           `We're sorry, but you've reached the end of search results.`
//         );
//         refs.loadMoreBtn.style.display = 'none';
//         refs.arrowDawn.style.display = 'none';
//         refs.arrowUp.style.display = 'none';
//       }
//     });
//   });
// }