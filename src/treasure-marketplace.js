
// rarity check
async function hasRarity (tokenName) {
  const res = await fetch(`https://treasure.tools/api/collections/${tokenName}/tokens-721?page=1&search=&filter=`)
  return res.status === 200
}
async function getRarity (tokenName, tokenId) {
  const res = await fetch(`https://treasure.tools/api/collections/${tokenName}/tokens-721?page=1&search=${tokenId}&filter=`)
  const json = await res.json()
  return json
}

function createButton (textContent) {
  const $button = document.createElement('button')
  $button.setAttribute('class', 'mx-2 hidden sm:inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-red-300 dark:border-gray-500 rounded text-xs md:text-sm font-bold text-white dark:text-gray-300 bg-red-500 dark:bg-gray-800 hover:bg-red-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-gray-700')
  $button.textContent = textContent || ''
  return $button
}

function getCurrentTokenName () {
  const path = document.location.pathname
  const parts = path.split('/')
  return parts[parts.length - 1]
}

function populate () {
  getTokenNodes()
  .map(child => {
    const titleWrapper = child.children[1]
    const title = titleWrapper.children[0]
    const parts = title.textContent.split('#')
    
    const tokenId = Number(parts[parts.length - 1])

    const $wrapper = document.createElement('div')
    $wrapper.setAttribute('class', 'flex justify-center items-center')

    const $button = createButton('Check Rarity')
    $button.addEventListener('click', () => {
      $button.textContent = 'Loading..'
      console.log('checking for', tokenId)
        getRarity(tokenName, tokenId)
        .then((response) => {
          if (response.count !== 0) {
            const token = response.list[0]
            $button.textContent = 'Rarity #' + token.nft_rank
            $button.setAttribute('title', `Rarity score ${token.rarity_score}\nTrait count: ${token.trait_count}\n1/1: ${token.is_one_of_one ? 'Yes' : 'No'}`)
          } else {
            $button.textContent = 'Not found!'
          }
        })
        .catch(err => {
          $button.textContent = 'Error'
          $button.setAttribute('title', 'Error: ' + err.message)
        })
    })
    $wrapper.appendChild($button)
    titleWrapper.append($wrapper)
  })
}

function populateWithMessage (message) {
  getTokenNodes()
  .map(child => {
    const title = child.children[1].children[0]
    const $p = document.createElement('p')
    $p.setAttribute('class', 'mt-8 text-sm md:text-base lg:text-xl text-gray-500 text-center max-w-lg lg:max-w-4xl')
    $p.textContent = message
    title.prepend($p)
  })
}

function getTokenNodes () {
  return [...document.querySelector('section[aria-labelledby="products-heading"] ul[role=list]').children]
}

// setup script
const tokenName = getCurrentTokenName()
if (await hasRarity(tokenName)) {
  populate()
} else {
  populateWithMessage('Rarity not available')
}