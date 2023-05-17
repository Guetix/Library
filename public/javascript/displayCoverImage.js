const image = document.querySelector('#coverImage')
let coverImage = ''

image.addEventListener('change',()=>{
    const reader = new FileReader()
    reader.addEventListener('load' ,()=>{
        coverImage = reader.result
        document.querySelector('#displayImg').style.backgroundImage = `url(${coverImage})`
    })
    reader.readAsDataURL(image.files[0])
})