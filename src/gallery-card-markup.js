
export function createMarkup(obj) {
  return `  <a class='photo-card'
    href=${obj.largeImageURL} rel="lightbox[gallery1]">
    <img src=${obj.webformatURL} alt=${obj.tags} loading='lazy' />
    <div class='info'>
      <p class='info-item'>
        <b>Likes</b>
        ${obj.likes}
      </p>
      <p class='info-item'>
        <b>Views</b>
        ${obj.views}
      </p>
      <p class='info-item'>
        <b>Comments</b>
        ${obj.comments}
      </p>
      <p class='info-item'>
        <b>Downloads</b>
        ${obj.downloads}
      </p>
    </div>
  </a>`;
}