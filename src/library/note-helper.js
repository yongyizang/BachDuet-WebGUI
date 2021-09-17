export function incrementDuration(duration){
    // Currently only support up to 1n.
    switch(duration){
        case "16n":
            return "8n";
        case "8n":
            return "8n.";
        case "8n.":
            return "4n";
        case "4n":
            return "4n+16n";
        case "4n+16n":
            return "4n.";
        case "4n.":
            return "4n.+16n";
        case "4n.+16n":
            return "2n";
        case "2n":
            return "2n+16n";
        case "2n+16n":
            return "2n+8n";
        case "2n+8n":
            return "2n+8n.";
        case "2n+8n.":
            return "2n.";
        case "2n.":
            return "2n.+16n.";
        case "2n.+16n":
            return "2n.+8n";
        case "2n.+8n":
            return "2n.+8n.";
        case "2n.+8n.":
            return "1n";
        default:
            throw new Error ("function incrementDuration doesn't support the duration you passed in: " + duration);
    }
}

export function note2num(note){
    let num = 0;
    switch(note){
        case "16n":
            num = 1; break;
        case "8n":
            num = 2; break;
        case "8n.":
            num = 3; break;
        case "4n":
            num = 4; break;
        case "4n+16n":
            num = 5; break;
        case "4n.":
            num = 6; break;
        case "4n.+16n":
            num = 7; break;
        case "2n":
            num = 8; break;
        case "2n+16n":
            num = 9; break;
        case "2n+8n":
            num = 10; break;
        case "2n+8n.":
            num = 11; break;
        case "2n.":
            num = 12; break;
        case "2n.+16n":
            num = 13; break;
        case "2n.+8n":
            num = 14; break;
        case "2n.+8n.":
            num = 15; break;
        case "1n":
            num = 16; break;
        default:
            throw new Error ("function note2num doesn't support the note you passed in: " + note);
    }
    return num;
}