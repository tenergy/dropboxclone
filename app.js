var express = require('express')
const pathmod = require('path')
var Watcher = require('watch-fs').Watcher;
var AWS = require('aws-sdk')
var fs = require('fs')
var s3 = new AWS.S3();

// For details and examples about AWS Node SDK,
// please see https://aws.amazon.com/sdk-for-node-js/

var myBucket = 'screenshot-demo-499';
var app = express()

//////////////// This is how your enable CORS for your web service /////////////
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


////// GET REQUESTS ///////
app.get('/list', function(req, res){
	var params = {
	  Bucket: myBucket
	};
	s3.listObjects(params, 	function(err, data){
	  for(var i = 0; i < data.Contents.length; i++) {
	  	data.Contents[i].Url = 'https://s3-us-west-1.amazonaws.com/' + data.Name + '/' + data.Contents[i].Key;
	  }
	  res.send(data.Contents);
	})
})waz a

//////////// Detect if a file has been changed////////////
var path = process.cwd()

var watcher = new Watcher({
    paths: path
});

watcher.on('create', function(filename) {
    console.log('file ' + filename + ' created');
    uploadFileToS3(filename);
});
watcher.on('change', function(filename) {
    console.log('file ' + filename + ' changed');
    uploadFileToS3(filename);
});
watcher.on('delete', function(filename) {
    console.log('file ' + filename + ' deleted');
    deleteFileToS3(filename);
});
watcher.start(function(err, failed) {
    console.log('watcher started');
    console.log('files not found', failed);
});


// Upload to S3 //
function uploadFileToS3(imageFilePath) {
  var fileName = pathmod.basename(imageFilePath)
	fs.readFile(imageFilePath, function (err, data) {
		params = {Bucket: myBucket, Key: fileName, Body: data, ACL: "public-read", ContentType: "text/plain"};
	    s3.putObject(params, function(err, data) {
	         if (err) {
	             console.log(err)
	         } else {
	             console.log("Successfully uploaded data to " + myBucket, data);
	         }
	    });
	});
}

// Delete from S3 //
function deleteFileToS3(imageFilePath) {
  var fileName = pathmod.basename(imageFilePath)
	fs.readFile(imageFilePath, function (err, data) {
		params = {Bucket: myBucket, Key: fileName};
	    s3.deleteObject(params, function(err, data) {
	         if (err) {
	             console.log(err)
	         } else {
	             console.log("Successfully uploaded data to " + myBucket, data);
	         }
	    });
	});
}

app.listen(4000, function () {
  console.log('Example app listening on port 4000!')
})
