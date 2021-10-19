const general_message = (msg, style) => {
    if( !msg ){ return; }
    (function(){ console.log(`%c  ${msg}  `, `${style}`); return 1})() // eslint-disable-line
}


export default function (msg) {
    general_message(msg, `background: #ff9984; color: #fff; border-radius: 1rem`)
}


const primary_message = function(msg){
    general_message(msg, `background: #4199ee; color: #fff`)
}
const warn_message = function(msg) {
    general_message(msg, `background: #ff0000; color: #fff`)
}
const change_message = function(msg) {
    general_message(msg, `background: #428841; color: #fff`)
}
export {
    primary_message,
    warn_message,
    change_message,
}