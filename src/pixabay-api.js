// https://pixabay.com/api/?key=34707727-e20630cf7e49276d83ab15980&q=yellow+flowers&image_type=photo
// const BASE_URL = 'https://pixabay.com/api/';
// const API_KEY = '34707727-e20630cf7e49276d83ab15980';

export class PixabayApi {
  #BASE_URL = 'https://pixabay.com/api/';
  #API_KEY = '34707727-e20630cf7e49276d83ab15980';

  options = new URLSearchParams([
    ['orientation', 'horizontal'],
    ['safesearch', 'true'],
    ['per_page', 9],
    ['image_type', 'photo'],
  ]);
  page = 1;

  async fetch(query) {
    const response = await fetch(
      `${this.#BASE_URL}?key=${this.#API_KEY}&q=${query}&page=${this.page}&${
        this.options
      }`
    );
    return await response.json();
  }
}


