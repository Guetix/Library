let data = [
    {
        id: 1,
        titre: "hello world",
        Prix : 54.6,
        URL : 'https://example.com'
    },
    {
        id: 2,
        titre: "hello world",
        Prix : 54.6,
        URL : 'https://example.com'
    },
    {
        id: 3,
        titre: "hello world",
        Prix : 54.6,
        URL : 'https://example.com'
    },

]

const getLivre = (param) => {
    const val = data.find(ele => ele.id == param)
    return val 
}
const addLivre = (livre) => {
    data = [...data, livre]
    return data
}
const updateLivre = (livre) => {
    eleIndex = data.findIndex((ele => ele.id == livre.id))
    data[eleIndex] = {...livre , ...data[eleIndex]}
    return data
}
const deleteLivre = (livre) => {
     data =  data.filter(ele => ele.id != livre.id)
    return data
}


module.exports = {
    data,
    getLivre,
    addLivre,
    updateLivre,
    deleteLivre
}