var rp = require('request-promise')
var cheerio = require('cheerio')
var crawl = require('./helper')
var insertDB = require('./saveDB')
require('dotenv').config({path: '.env'})
let minPage = parseInt(process.env.MIN_PAGE)
let maxPage = parseInt(process.env.MAX_PAGE)

const classListPost = ".td-block-span6 .entry-title a"
const classBodyContent = ".td-post-content"
const classRemove = ['.advads-adsense-responsive','.advads-adsense-top','.advads-adsense-mid1',
                    '.advads-adsense-mid2','.advads-adsense-mid3','.td-featured-image-rec',
                    '.nc_socialPanel','.fb-comments','.advads-taboola-after']
const CATE_ID = process.env.CATE_ID
// Bat tu crawl tu page
for(page = minPage; page <= maxPage; page++)
{
    pageURL = process.env.URI.replace("$index",page)
    console.log(`Crawling ${pageURL} ....`)
    rp.get(pageURL)
    .then(htmlString => {
        var $ = cheerio.load(htmlString)
       $(classListPost).each((i,element) => {
            let url = $(element).attr('href')
            crawl(url,classBodyContent,classRemove)
            .then(data => {
                insertDB(data,CATE_ID)
            })
            .catch(err => {console.log(err)})
       })
    })
    .catch(err => {
        console.log(`Has error when crawl ${pageURL} `)
    })
}
