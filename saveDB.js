var conn = require('./connection')
/**
 * Function save Data crawl to Database
 * @param {Object} dataObj 
 * @param {int} cateId 
 */
var insertDB = function(dataObj,cateId){
    conn('posts')
    .returning('id')
    .insert({
        name : dataObj.title || "Unknow",
        slug : dataObj.slug,
        description : dataObj.description,
        content : dataObj.body,
        status : 0,
        user_id : 1,
        featured : 0,
        image : dataObj.filePath
    })
    .then(postId => {
        conn('post_category').insert({
            category_id : cateId,
            post_id : postId
        })
    })
    .then(() => {
        console.log(`Save thanh cong ${postId}`)
    })
    .catch(err => {console.log(err.sqlMessage)})
}

module.exports = insertDB