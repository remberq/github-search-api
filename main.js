
async function repo(query, page = 1, perPage = 5) {
    if (query) {
        const reps = (await fetch(`https://api.github.com/search/repositories?q=${query}&per_page=${perPage}&page=${page}`)).json()

        return reps.then(val => val.items)
    }
    return []
}


const container = document.querySelector('.container')
const repoData = container.querySelector('.repo-data')
const input = container.querySelector('.input')
const autoComplete = container.querySelector('.autocomplete')

const DATABASE = [] // база данных, для быстрого добавления элемента в список при клике по автокомплиту

function databaseFilter(user) {
    // при клике по автокомплиту ищет из базы нужный нам репозиторий и после очищает базу
    const userToAdd = DATABASE.filter(item => item.name === user)
    DATABASE.length = 0
    return userToAdd
}

const debounce = (fn, debounceTime) => {
    // ограничивает запросы к гитхаб апи
    let time
    return function (...args) {
        clearTimeout(time)
        time = setTimeout(() => {
            fn.apply(this, args)
        }, debounceTime)
    }
}

function closeRepoData(elem) {
    // при клике на крестик удаляет этот элемент
    const parent = elem.target.closest('.repo-data__content')
    repoData.removeChild(parent)
}

function addRepoData(name, login, stars) {
    // добавляет репозитории при клике по автокомплиту и сразу убирает поле автокомплита и очищает поле ввода
    const repoFrag = document.createDocumentFragment()
    const wrap = document.createElement('div')
    const btn = document.createElement('button')
    btn.addEventListener('click', closeRepoData)
    btn.classList.add('btn')
    wrap.classList.add('repo-data__content')
    const repoText = document.createElement('p')
    repoText.innerText = `Name: ${name}
                              Owner: ${login}
                              Stars: ${stars}`
    wrap.appendChild(repoText)
    wrap.appendChild(btn)
    repoFrag.appendChild(wrap)
    repoData.appendChild(repoFrag)
    input.value = ''
    autoComplete.innerHTML = ''
    input.classList.remove('borders')
}

async function eventer(elem) {
    // в зависимости от количества добавленых репозиториев добавляет новые и удаляет старые если их больше трех
    const [userData] = databaseFilter(elem.target.textContent)
    if (repoData.children.length < 2) {
        addRepoData(userData.name, userData.owner.login, userData.stargazers_count)
    }
    else {
        repoData.removeChild(repoData.firstChild)
        addRepoData(userData.name, userData.owner.login, userData.stargazers_count)
    }
}

input.addEventListener('keyup', debounce(async (e) => {
    let data = e.target.value
    const search = await repo(data)
    DATABASE.length = 0
    DATABASE.push(...search)
    const res = []
    for (let i of search) {
        let html = `<li class="auto__li">${i.name}</li>`
        res.push(html)
    }
    autoComplete.innerHTML = res.join('')
    input.classList.add('borders')
    const autoLi = autoComplete.querySelectorAll('.auto__li')
    for (let li of autoLi) {
        li.addEventListener('click', eventer)
    }
}, 700))



