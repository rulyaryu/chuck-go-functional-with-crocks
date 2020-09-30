import { Async } from 'crocks';
import maybeToAsync from 'crocks/Async/maybeToAsync';
import { applyTo } from 'crocks/combinators';
import curry from 'crocks/core/curry';
import isString from 'crocks/core/isString';
import { composeK } from 'crocks/helpers';
import compose from 'crocks/helpers/compose';
import tap from 'crocks/helpers/tap';
import { not } from 'crocks/logic';
import when from 'crocks/logic/when';
import getPath from 'crocks/Maybe/getPath';
import propPath from 'crocks/Maybe/propPath';
import safe from 'crocks/Maybe/safe';
import safeAfter from 'crocks/Maybe/safeAfter';
import { option } from 'crocks/pointfree';
import ap from 'crocks/pointfree/ap';
import chain from 'crocks/pointfree/chain';
import map from 'crocks/pointfree/map';
import { isNil } from 'crocks/predicates';



const apiGet = curry((url) => fetch(url, {}).then(res => res.json()));

const asyncGet = Async.fromPromise(apiGet)


// console.log(asyncGet('https://api.chucknorris.io/jokes/categories'));

const CardData = (category) => ({
    title: category,
    picture: `https://loremflickr.com/g/320/240/${category}`,
    action: `https://api.chucknorris.io/jokes/random?category=${category}`
})


const CardHtml = ({ title, picture, action }) => `
<div class="rounded overflow-hidden shadow-lg">
<div class="relative pb-1/2 bg-red-500">
    <img loading="lazy" class="absolute object-cover top-0 left-0 h-full block w-full"
        src="${picture}" alt="paris">

</div>
<div class="text-orange-200 p-2">
    <h3 class="font-medium tracking-wide uppercase">${title}</h3>
    <button
        data-action="${action}"
        class="mt-8 bg-transparent hover:bg-red-500 text-orange-200 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded">
        give me chuck
    </button>
</div>
</div>
`

const makeResultHTML =
    map(
        compose(
            CardHtml,
            CardData
        )
    )

const getElemSafe = safeAfter(
    not(isNil),
    (s) => document.querySelector(s)
)


const getElemAsync = compose(maybeToAsync('no element!'), getElemSafe)


const insertToDom = compose(
    map(el => html => (el.insertAdjacentHTML('beforeend', html), el)),
    getElemAsync
)

const insertToElem =
    el => html => (el.insertAdjacentHTML('beforeend', html), el)

const addClass = cls => el => (el.classList.add(cls), el);
const removeClass = cls => el => (el.classList.remove(cls), el);
const removeAttr = attr => el => (el.removeAttribute(attr), el)

const showContainer = compose(addClass('flex'), removeClass('hidden'))

// console.log(insertToDom('body'));

const getCategories = Async
    .Resolved(["animal", "career", "celebrity", "dev",
        "explicit", "fashion", "food", "history",
        "money", "movie", "music", "political",
        "religion", "science", "sport", "travel"
    ])
    .map(makeResultHTML)
    .map(x => x.join(''))

insertToDom('body')
    .ap(getCategories)
    .fork(console.log, console.log)



// const getChuck = action => Async.Resolved(['action', action])

const fork = (g, f) => as => as.fork(e => g(e), x => f(x))


const Chuck = ({ value, icon_url }) => ({
    text: value,
    iconSrc: icon_url
})


const createPopup = (Chuck) => `
        <div data-popup class="animate-rollin bg-red-400 flex items-center m-auto mb-2 p-4 rounded shadow-lg text-white text-xl w-1/2">
            <span class="mr-2"><img src="${Chuck.iconSrc}"/></span> <span>${Chuck.text}</span>
        </div>
`

const delay = curry(Async.resolveAfter)

const hideContainer = compose(
    map(when(el => !el.children.length, el => el.classList.add('hidden'))),
    getElemAsync
)

const cleanUpItems =
    compose(
        chain(x => hideContainer('[data-popup-container]')),

        map(el => el.remove()),

        chain(delay(5000)),

        map(removeAttr(['data-popup'])),
        getElemAsync
    )

// console.log(cleanUp('[data-popup]'))

const chuckPopup =
    url => asyncGet(url)
        .map(Chuck)
        .map(createPopup)
// Async.Resolved({
//     icon_url: "https://assets.chucknorris.host/img/avatar/chuck-norris.png",
//     value: "In the beginning there was nothing...then Chuck Norris Roundhouse kicked that nothing in the face and said \"Get a job\". That is the story of the universe."
// })


const showPopup = html => getElemAsync('[data-popup-container]')
    .map(showContainer)
    .map(insertToElem)
    .map(applyTo(html))


document.addEventListener('click',
    compose(
        fork(console.log, console.log),
        chain(x => cleanUpItems('[data-popup]')),
        chain(showPopup),
        chain(chuckPopup),
        maybeToAsync('no action provided'),
        getPath(['target',
            'dataset', 'action'
        ]),
    ))