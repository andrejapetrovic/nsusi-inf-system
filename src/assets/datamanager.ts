import { Student } from './models/student';
import { ipcMain } from "electron";
import { StudInfo } from './models/stud-info';

export class DataManager {

    
    constructor (){

        const MongoClient = require('mongodb').MongoClient;
        const url = 'mongodb+srv://aki:123@cluster0-jgedm.gcp.mongodb.net';
        const client = new MongoClient(url, { useNewUrlParser: true });

        
        client.connect( err => {
            if (err) throw err;

            console.log("Connected correctly to server");
            const dbs = client.db('nsusi');
            

     
                // Get the documents collection
                const students = dbs.collection('students');
                // Find some documents
                students.find({}).toArray( (err, docs) => {
                  if (err) throw err;
                  console.log("Found the following records");
                  console.log(docs);
                });
              

        })


        let Datastore = require('nedb');
        let db: any = {};

        db.students = new Datastore({ filename: 'src/assets/data/student.db', autoload: true });

        ipcMain.on('getStudents', (event, arg) => {
            db.students.find({}, (error, studs: Student[]) => {  
                if (error) throw error
                event.sender.send('sendStudents', studs);
          });
        })

        ipcMain.on('addStudent', (event, arg: Student) => {
            db.students.insert(arg,  (error, newStud: Student) => {  
                if (error) throw error
                event.sender.send('newStudent', newStud);
              });
        })

        var bcrypt = require('bcryptjs');

        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash("test", salt, function(err, hash) {
                // Store hash in your password DB.
                console.log(hash);
                bcrypt.compare("test", hash, function(err, res) {
                    // res === true
                    console.log(res);
                });
                bcrypt.compare("not_bacon", hash, function(err, res) {
                    console.log(res);
                });

            });
        });
    }

}