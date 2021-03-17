import AWS from 'aws-sdk';
import { useState, useEffect } from 'react';

AWS.config.update({
  accessKeyId: "AKIA6EHMZQLBW7P3YMFU",
  secretAccessKey: "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",
  region: "us-east-2"
});
const s3 = new AWS.S3();
const params = {
  Bucket: 'foto.bucket.topicos.utfpr',
  Delimiter: '',
};

function encode(data) {
  var str = data.reduce(function (a, b) { return a + String.fromCharCode(b) }, '');
  return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
}

function getHtml(template) {
  return template.join('\n');
}

const App = () => {
  const [listFiles, setListFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');

  const onFileChange = event => {
    setSelectedFile(event.target.files[0]);
  };

  const onFileUpload = () => {
    console.log(selectedFile)
    var fileName = selectedFile.name;
    var upload = new AWS.S3.ManagedUpload({
      params: {
        Bucket: params.Bucket,
        Key: fileName,
        Body: selectedFile
      }
    });

    var promise = upload.promise();

    promise.then(
      function (data) {
        alert("Successfully uploaded photo.");
        setListFiles([]);
        updatePhotos();
      },
      function (err) {
        return alert("There was an error uploading your photo: ", err.message);
      }
    );
  }
  const updatePhotos = () => {
    s3.listObjectsV2(params, function (err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        var href = 'https://s3.us-east-2.amazonaws.com/';
        var bucketUrl = href + params.Bucket + '/';

        data.Contents.map(function (photo) {
          var photoKey = photo.Key;
          var photoUrl = bucketUrl + encodeURIComponent(photoKey);
          setListFiles(state => [...state, photoUrl]);
        });
      }

    });
  }
  useEffect(() => {
    updatePhotos()
  }, []);

  const style = {
    image: {
      width: '300px',
      height: '300px',

    },
    container: {
      display: 'flex',
      justifyContent: 'space-around'
    },

    column: {
      display: 'flex',
      flexDirection: 'column'
    }

  };

  return (
    <div>
      <div style={style.container}>
        {
          listFiles && listFiles.map(file => {
            return (
              <>
                <img src={file} style={style.image}></img>
              </>
            )
          })
        }


      </div>
      <div>
        <input type="file" onChange={onFileChange} />
        <button onClick={onFileUpload}>
          Upload!
       </button>
      </div>
    </div>
  );
}

export default App;
