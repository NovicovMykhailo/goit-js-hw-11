// import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { createMarkup } from './gallery-card-markup.js';
import { PixabayApi } from './pixabay-api';

Notiflix.Notify.init({
  width: '300px',
  position: 'left-top',
  closeButton: false,
  distance: '20px	',
});

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

refs.form.addEventListener('submit', e => {
  e.preventDefault();
  refs.spinner.style.opacity = 1;
  try {
    if (inputEl.value !== '') {
      getImages(inputEl.value).then(() => {
        refs.spinner.style.opacity = 0;
      });
    } else {
      Notiflix.Notify.warning(`The search tab cannot be empty`);
      clearAll();
    }
  } catch {
    refs.spinner.style.opacity = 0;
    Notiflix.Notify.failure('Ooops, Something went wrong');
    refs.loadMoreBtn.style.display = 'none';
  }
});

async function getImages(query) {
  return await pixabayApi
    .fetch(query)
    .then(data => {
      if (data.totalHits !== 0) {
        imageCounter += data.hits.length;
        console.log(imageCounter);
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
      if (images.length < 9) {
        console.log(images.length);
        refs.loadMoreBtn.style.display = 'none';
      } else {
        refs.loadMoreBtn.style.display = 'block';
      }
      const markup = images.map(createMarkup);
      refs.gallery.innerHTML = markup.join('');
      smoothScroll();

      addSimpleLightBox();
      // loadMoreImages(query);
      window.addEventListener('scroll', () => {
        let currentViewHeight =
          refs.gallery.scrollHeight - document.documentElement.scrollTop - 788;
        if (currentViewHeight <= 100) {
          infiniteLoading(query);
        }
      });
    });
}

function addSimpleLightBox() {
  const options = {
    enableKeyboard: true,
    docClose: true,
    doubleTapZoom: 2,
    scrollZoom: true,
    preloading: true,
    animationSpeed: 0,
    animationSlide: true,
    // showCounter: false,
  };

  let gallery = new SimpleLightbox('.gallery a', options);
  gallery.on('show.simplelightbox');
  return gallery;
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
  });
}

window.onscroll = function (e) {
  let items = document.querySelectorAll('.gallery a');
  if (window.scrollY < 700) {
    refs.arrowDawn.style.opacity = 0;
    refs.arrowUp.style.opacity = 0;
  } else if (items.length > 9) {
    refs.arrowDawn.style.opacity = 1;
    refs.arrowUp.style.opacity = 1;
  }
};

function infiniteLoading(query) {
  
    pixabayApi.page += 1;
    pixabayApi.fetch(query).then(data => {
      refs.arrowDawn.style.display = 'block';
      refs.arrowUp.style.display = 'block';
      imageCounter += data.hits.length;
      refs.gallery.insertAdjacentHTML(
        'beforeEnd',
        data.hits.map(createMarkup).join('')
      );
      addSimpleLightBox().refresh();
      smoothScrollArrow();
      if (imageCounter === data.totalHits) {
        Notiflix.Notify.info(
          `We're sorry, but you've reached the end of search results.`
        );
        refs.loadMoreBtn.style.display = 'none';
        refs.arrowDawn.style.display = 'none';
        refs.arrowUp.style.display = 'none';
      }
    });

}