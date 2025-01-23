import express, { Request, Response } from 'express';
import fs from 'fs';
import cors from 'cors';
import readline from 'readline';

const app = express();
app.use(cors());

const port = process.env.PORT || 8080;

interface Pilot {
    pilotId: string;
    nameArray: string[];
    addressArray: string[];
    certsArray: string[];
}

interface Matches {
    [key: number]: {
        firstName: string;
        middleName: string;
        lastName: string;
        otherNameData: string[];
        address: string;
        certificates: string;
    };
}

app.get('/faaPilotVerifyV2', (req: Request, res: Response) => {
    const key = req.query.apikey as string;
    let fName: string = req.query.fName as string;
    let mName: string = (req.query.mName as string) || '';
    let lName: string = req.query.lName as string;
    const mMatches: string = req.query.maxMatches as string;
    let maxMatches: number = 5;

    // THIS IS NOT A SECURE WAY TO IMPLEMENT API KEYS
    // DO NOT USE THIS IN PRODUCTION
    if (!key || (key && key != 'custom_api_key_here')) {
        res.json({ error: 'Invalid API Key' });
        console.log('Invalid API Key');
        return;
    }

    if (!fName || !lName) {
        res.json({
            error: 'First and last name query parameters are required'
        });
        return;
    }

    fName = fName.toUpperCase();
    mName = mName.toUpperCase();
    lName = lName.toUpperCase();

    if (mMatches) {
        maxMatches = parseInt(mMatches, 10);
    }

    const rl = readline.createInterface({
        input: fs.createReadStream('PILOT.txt'),
        crlfDelay: Infinity
    });

    let found = false;
    let pilotLineId = '';
    let currentPilot: Pilot = {
        pilotId: '',
        nameArray: [],
        addressArray: [],
        certsArray: []
    };
    let matchCount = 0;
    let matches: Matches = {};

    rl.on('line', (line: string) => {
        let isSamePilot = false;
        pilotLineId = line.substring(0, 10).trim();

        if (pilotLineId.substring(0, 9) === currentPilot.pilotId.substring(0, 9)) {
            isSamePilot = true;
        } else {
            currentPilot.pilotId = pilotLineId;
        }

        if (!isSamePilot) {
            if (currentPilot.nameArray.length > 0) {
                if (fName.length > 0 && mName.length > 0 && lName.length > 0) {
                    if (currentPilot.nameArray[0] === fName && currentPilot.nameArray[1] === mName && currentPilot.nameArray[2] === lName) {
                        found = true;
                        matchCount += 1;
                        matches[matchCount] = {
                            firstName: currentPilot.nameArray[0],
                            middleName: currentPilot.nameArray[1],
                            lastName: currentPilot.nameArray[2],
                            otherNameData: currentPilot.nameArray.length > 3 ? currentPilot.nameArray.slice(3) : [],
                            address: currentPilot.addressArray.join(' '),
                            certificates: currentPilot.certsArray.join(' ')
                        };
                        if (matchCount === maxMatches) {
                            rl.close();
                        }
                    }
                } else {
                    const a = currentPilot.nameArray[0] === fName && currentPilot.nameArray[1] === lName;
                    const b = currentPilot.nameArray[0] === fName && currentPilot.nameArray[2] === lName;
                    if (a || b) {
                        found = true;
                        matchCount += 1;
                        matches[matchCount] = {
                            firstName: currentPilot.nameArray[0],
                            middleName: a ? '' : currentPilot.nameArray[1],
                            lastName: a ? currentPilot.nameArray[1] : currentPilot.nameArray[2],
                            otherNameData: currentPilot.nameArray.length > 2 ? currentPilot.nameArray.slice(2) : [],
                            address: currentPilot.addressArray.join(' '),
                            certificates: currentPilot.certsArray.join(' ')
                        };
                        if (matchCount === maxMatches) {
                            rl.close();
                        }
                    }
                }
            }
            currentPilot.certsArray = [];
            currentPilot.nameArray = line.substring(10, 70).replace(/\s+/g, ' ').trim().split(' ');
            currentPilot.addressArray = line.substring(70, 183).replace(/\s+/g, ' ').trim().split(' ');
        } else {
            const temp = line.substring(10).replace(/\s+/g, ' ').trim().split(' ');
            temp.forEach((element) => {
                if (element.includes('/')) {
                    currentPilot.certsArray.push(element.substring(element.indexOf('/') - 1));
                }
            });
        }
    });

    rl.on('close', () => {
        if (!found) {
            res.json({
                error: 'Name not found'
            });
        } else {
            res.json({ matches });
        }
    });

    rl.on('error', (err: Error) => {
        res.json({
            error: 'Error reading file'
        });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
