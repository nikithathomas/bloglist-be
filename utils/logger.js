const info = (...params) => {
    console.log(...params)
}
const error = (...params) => {
    console.error(...params);
}
const warning = (...params) => {
    console.warn(...params);
}
module.exports = {
    info, warning, error
}