// import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { createMarkup } from './gallery-card-markup.js';
import { PixabayApi } from './pixabay-api';

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
    getImages(inputEl.value).then(() => (refs.spinner.style.opacity = 0));
  } catch {
    refs.spinner.style.opacity = 0;
    Notiflix.Notify.error('Sol lucet omnibus');
  }
});

async function getImages(query) {
  return await pixabayApi
    .fetch(query)
    .then(data => data.hits)
    .then(image => {
      const markup = image.map(createMarkup);
      refs.gallery.innerHTML = markup.join('');

      let gallery = new SimpleLightbox('.gallery a');
      gallery.on('show.simplelightbox');
    });
}





// const simpleboxOptions = [
//   (gallery.options.captionsData = 'alt'),
//   (gallery.options.captionDelay = 250),
//   (gallery.options.overlayOpacity = 0.1),
//   (gallery.options.showCounter = true),
// ];

// function simpleboxKeyNav() {
//   window.addEventListener('keypress', event => {
//     if (event.key === 'ArrowRight') {
//       gallery.next();
//     } else if (event.key === 'ArrowLeft') {
//       gallery.prev();
//     }
//   });
// }
