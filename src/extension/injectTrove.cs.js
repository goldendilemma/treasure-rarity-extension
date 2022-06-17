/**
          ████
        ██░░░░██
      ██░░░░░░░░██
      ██░░░░░░░░██
    ██░░░  ░░  ░░░██
    ██░░░█ ░░█ ░░░██
    ██░░░░░░░░░░░░██
      ██░░░  ░░░██
        ████████
 */

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
  $button.setAttribute('class', 'px-4 py-2 text-sm text-page bg-accent hover:bg-accent-light border-transparent w-full transition inline-flex items-center justify-center border font-body font-bold rounded-xl shadow-sm focus:outline-none')
  $button.textContent = textContent || ''
  return $button
}

function getCurrentTokenName (path) {
  const parts = path.split('/')
  return parts[parts.length - 1]
}

function isPopulated ($node) {
  return $node.getAttribute('data-rarity-check') != null
}

function setPopulated($node) {
  $node.setAttribute('data-rarity-check', 'true')
}

function populate (tokenName) {
  const $nodes = getTokenNodes()
  if (!$nodes) {
    console.warn('No nodes', tokenName)
    return
  }
  for (let $node of $nodes) {
    if (isPopulated($node)) continue;
    const infoWrapper = $node?.children?.[1]
    const bottomWrapper = infoWrapper?.children?.[1]
    const titleWrapper = bottomWrapper?.children?.[0]
    
    if (!titleWrapper) continue;

    const parts = titleWrapper.textContent.split('#')
    const tokenId = Number(parts[parts.length - 1])

    const $wrapper = document.createElement('div')
    $wrapper.setAttribute('class', 'flex justify-center items-center pt-2')

    const $button = createButton('Check Rarity')
    $button.addEventListener('click', () => {
      $button.textContent = 'Loading..'
        getRarity(tokenName, tokenId)
        .then((response) => {
          $button.setAttribute('disabled', 'disabled')
          $button.classList.remove('hover:bg-accent-light')
          $button.classList.add('bg-default', 'text-page') 
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
    bottomWrapper.append($wrapper)
    setPopulated($node)
  }
}

function populateWithMessage (message) {
  const $nodes = getTokenNodes()
  if (!$nodes) {
    console.warn('No nodes', tokenName)
    return
  }
  for (let $node of $nodes) {
    if (isPopulated($node)) continue;
    const title = $node.children[1].children[1].children[0]
    const $p = document.createElement('p')
    $p.setAttribute('class', 'mt-8 text-sm md:text-base lg:text-xl text-gray-500 text-center max-w-lg lg:max-w-4xl')
    $p.textContent = message
    title.append($p)
  }
}

function getTokenNodes () {
  const container = document.getElementsByClassName('sm:grid-cols-collection-grid-lg snap-y snap-proximity grid grid-cols-2  grid-flow-row gap-2 sm:gap-5')?.[0]
  return container != null
    ? [...container.children]
    : null
}

async function wait (ms) {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => resolve(), ms)
    } catch(error) {
      reject(error)
    }
  })
}

async function loop (cb, opts = {}) {
  const { waitFor = 1000 } = opts
  while (true) {
    await wait(waitFor)
    await cb()
  }
}

/**
 * @credits Leonardo Ciaccio https://stackoverflow.com/questions/3522090/event-when-window-location-href-changes
 */
function setupObserver (cb) {
  var oldPath = document.location.pathname;
  var bodyList = document.querySelector("body")
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (oldPath != document.location.pathname) {
        oldPath = document.location.pathname;
        cb(oldPath)
      }
    });
  });
  
  var config = {
      childList: true,
      subtree: true
  };
  
  observer.observe(bodyList, config);
}

async function setup () {
  let tokenName = getCurrentTokenName(document.location.pathname)
  const shouldLoop = await hasRarity(tokenName)
  setupObserver((path) => tokenName = getCurrentTokenName(path))
  if (shouldLoop) {
    loop(() => populate(tokenName))
  } else {
    populateWithMessage('Rarity not available')
  }
}

setup()