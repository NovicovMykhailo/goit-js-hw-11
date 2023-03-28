// import Notiflix from 'notiflix';
import createCardMockup from './templates/gallerycard.hbs';
// import axios from 'axios';
// import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { PixabayApi } from './pixabay-api';


const pixabayApi = new PixabayApi()

// const Handlebars = require('handlebars');

// new SimpleLightbox('.some-element a', {
//   /* options */
// });

// Notiflix.Notify.success('Sol lucet omnibus');

pixabayApi.fetch('book').then(e => console.log(e.hits.map(createCardMockup)));

