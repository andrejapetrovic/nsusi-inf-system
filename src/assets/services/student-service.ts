import { IpcMain } from 'electron';
import * as path from "path";

export class StudentService {

    constructor (db, ipcMain: IpcMain){
        const fs = require('fs');

        const crypto = require('crypto');
        const algorithm = 'aes-256-cbc';
        const key = fs.readFileSync(path.join(__dirname, '../../../../../src/assets/config/enc.nsusi'));    
        const iv = crypto.randomBytes(16);

        const students = db.collection('students');

        ipcMain.on('getStudents', (event, arg) => {
            
            students.find({}).toArray( (err, docs) => {
              if (err) throw err;
              console.log("students: ");
              docs.forEach(stud => {
                  stud._id = stud._id.toString();
                  stud.brLicne = decrypt(stud.brLicne);
                  stud.jmbg = decrypt(stud.jmbg);
              });
              event.sender.send('sendStudents', docs);
            });
        })

        ipcMain.on('addStudent', (event, arg) => {
            arg.brLicne = encrypt(arg.brLicne);
            arg.jmbg = encrypt(arg.jmbg);
            students.insert(arg,  (error, response) => {  
                if (error) throw error
                //console.log(response.ops[0]);
                let stud = response.ops[0];
                stud._id = stud._id.toString();
                stud.brLicne = decrypt(stud.brLicne);
                stud.jmbg = decrypt(stud.jmbg);
                event.sender.send('newStudent', stud);
              });
        })

        var ObjectID = require('mongodb').ObjectID;

        ipcMain.on('updateStudent', (event, arg) => {
            arg.brLicne = encrypt(arg.brLicne);
            arg.jmbg = encrypt(arg.jmbg);
            let id = ObjectID(arg._id);
            delete arg._id;
            students.updateOne({_id: id}, { $set:arg }, error  => {  
                if (error) throw error
                event.sender.send('confirmUpdate', {});
              });
        })

/*        var bcrypt = require('bcryptjs');

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
        });*/
     
        const encrypt = (text) => {
         let cipher = crypto.createCipheriv(algorithm, key, iv);
         let encrypted = cipher.update(text);
         encrypted = Buffer.concat([encrypted, cipher.final()]);
         return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
        }
        
         const decrypt = (text) => {
         let iv = Buffer.from(text.iv, 'hex');
         let encryptedText = Buffer.from(text.encryptedData, 'hex');
         let decipher = crypto.createDecipheriv(algorithm, key, iv);
         let decrypted = decipher.update(encryptedText);
         decrypted = Buffer.concat([decrypted, decipher.final()]);
         return decrypted.toString();
        }

    }



}