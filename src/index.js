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
};

const inputEl = refs.form.elements[0];
const submitBtn = refs.form.elements[1];

refs.form.addEventListener('submit', e => {
  e.preventDefault();
  refs.spinner.style.opacity = 1;
  try {
    getImages(inputEl.value).then(() => {
      refs.spinner.style.opacity = 0;
    });
  } catch {
    refs.spinner.style.opacity = 0;
    Notiflix.Notify.error('Sol lucet omnibus');
  }
});

async function getImages(query) {
  return await pixabayApi
    .fetch(query)
    .then(data => {
      if (data.totalHits !== 0) {
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      } else {
        Notiflix.Notify.info(
          `Sorry! We can't find any images. at your request. Please try again`
        );
      }

      return data.hits;
    })
    .then(images => {
      const markup = images.map(createMarkup);
      refs.gallery.innerHTML = markup.join('');
      addSimpleLightBox();
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
    showCounter: false,
  };

  let gallery = new SimpleLightbox('.gallery a', options);
  gallery.on('show.simplelightbox');
}

// SimpleLightBox Бібліотека містить метод refresh(),
// який обов'язково потрібно викликати щоразу після додавання нової групи карток зображень.
