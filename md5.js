
var md5 = function () {
    "use strict";
    var self = {};

    var bytesFromUTF8 = function (str) {
        var i, bytes = [];

        // convert string to a byte array
        for (i = 0; i < str.length; i = i + 1) {
            var c = str.charCodeAt(i);
            var charBytes = [];
            do {
                charBytes.push(c & 0xFF);
                c = c >> 8;
            } while (c > 0);
            bytes = bytes.concat(charBytes.reverse());
        }
        return bytes;
    };

    var bytesFromHex = function (str) {
        // convert hex string into an array of bytes
        var bytes = [];
        var i;
        for (i = 0; i < str.length; i += 2) {
            bytes.push(parseInt(str.slice(i, i + 2), 16));
        }
        return bytes;
    };

    var bytesFromBase64 = function (str) {
        var base64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var buf1, buf2, buf3, buf4;
        var bytes = [];
        var i, b;
        for (i = 0; i < str.length; i += 4) {

            buf1 = base64.indexOf(str.charAt(i));
            buf2 = base64.indexOf(str.charAt(i + 1));
            buf3 = base64.indexOf(str.charAt(i + 2));
            buf4 = base64.indexOf(str.charAt(i + 3));

            bytes.push((buf1 << 2) | (buf2 >> 4));

            b = ((buf2 & 15) << 4) | (buf3 >> 2);
            if (b !== 64) {
                bytes.push(b);
            }

            b = ((buf3 & 3) << 6) | buf4;
            if (b !== 64) {
                bytes.push(b);
            }
        }
        return bytes;
    };

    var asBytes = function (word) {
        // Converts a number to an array of 4 bytes
        var bytes = [];
        var i;

        // The least significant byte should be first
        for (i = 0; i < 4; i = i + 1) {
            bytes.push(word & 0xff);
            word >>>= 8;
        }

        return bytes;
    };

    var asWord = function (bytes) {
        // Convert an array of four bytes into a word
        var word;
        var i;

        for (i = 3; i >= 0; i = i - 1) {
            word = word * Math.pow(2, 8); // unsigned left shift
            word |= (bytes[i] & 0xff);
        }

        return word;
    };

    var F = function (x, y, z) {
        return asBytes((asWord(x) & asWord(y)) | ((~asWord(x)) & asWord(z)));
    };

    var G = function (x, y, z) {
        return asBytes((asWord(x) & asWord(z)) | (asWord(y) & (~asWord(z))));
    };

    var H = function (x, y, z) {
        return asBytes(asWord(x) ^ asWord(y) ^ asWord(z));
    };

    var I = function (x, y, z) {
        return asBytes(asWord(y) ^ (asWord(x) | (~asWord(z))));
    };

    var rotateLeft = function (x, n) {
        var xWord = asWord(x);
        return asBytes((xWord << n) | (xWord >>> (32 - n)));
    };

    var addWords = function (w1, w2) {
        // Add two 4 byte arrays together and return another 4 byte array
        var result = [];
        var carry = 0;
        var buf = 0;
        var i;
        // The least significant byte should be first
        for (i = 0; i < 4; i += 1) {
            buf = (w1[i] + w2[i] + carry);
            carry = buf & 0xff00;
            result.push(buf & 0xff);
            carry >>>= 8;
        }
        return result;
    };

    var processWord = function (a, b, c, d, x, s, ac, func) {
        return addWords(rotateLeft(addWords(a, addWords(func(b, c, d), addWords(x, ac))), s), b);
    };

    var convertToHex = function (a, b, c, d) {
        // Encode these four words as a lower case hex string
        var result = "", str = "";
        var bytes = a.concat(b, c, d);
        var i = 0;
        for (i = 0; i < bytes.length; i += 1) {
            str = bytes[i].toString(16);
            result += ('00' + str).slice(-2);
        }
        return result;
    };

    var computeHash = function (bytes) {
        // Keep the orignal length for later
        var len = bytes.length * 8;

        // Add padding
        // We always pad it with a '1' bit followed by seven '0' bits (our inputs 
        // are always a multiple of 8 bits long so padding always adds another 8)
        bytes.push(128);

        // Keep adding 0 bits until we get to 64 bits under the next 512 multiple
        while (((bytes.length * 8) % 512) < 448) {
            bytes.push(0);
        }

        // Append Length to byte array, lower order word first
        bytes.push(len & 0x00000000000000ff);
        bytes.push(len & 0x000000000000ff00);
        bytes.push(len & 0x0000000000ff0000);
        bytes.push(len & 0x00000000ff000000);

        bytes.push(len & 0x000000ff00000000);
        bytes.push(len & 0x0000ff0000000000);
        bytes.push(len & 0x00ff000000000000);
        bytes.push(len & 0xff00000000000000);

        // Function for getting words from the byte array
        var getBlock = function (i, k) {
            var k_bytes = i + (k * 4);
            return bytes.slice(k_bytes, k_bytes + 4);
        };

        // Initialize MD Buffer
        var a = [0x01, 0x23, 0x45, 0x67];
        var b = [0x89, 0xab, 0xcd, 0xef];
        var c = [0xfe, 0xdc, 0xba, 0x98];
        var d = [0x76, 0x54, 0x32, 0x10];

        // Setup the left shift contants
        var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
        var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
        var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
        var S41 = 6, S42 = 10, S43 = 15, S44 = 21;

        var AA, BB, CC, DD, i;

        for (i = 0; i < bytes.length; i += 64) {

            AA = a.slice(0);
            BB = b.slice(0);
            CC = c.slice(0);
            DD = d.slice(0);

            a = processWord(a, b, c, d, getBlock(i, 0), S11, [0x78, 0xA4, 0x6A, 0xD7], F);
            d = processWord(d, a, b, c, getBlock(i, 1), S12, [0x56, 0xB7, 0xC7, 0xE8], F);
            c = processWord(c, d, a, b, getBlock(i, 2), S13, [0xDB, 0x70, 0x20, 0x24], F);
            b = processWord(b, c, d, a, getBlock(i, 3), S14, [0xEE, 0xCE, 0xBD, 0xC1], F);
            a = processWord(a, b, c, d, getBlock(i, 4), S11, [0xAF, 0x0F, 0x7C, 0xF5], F);
            d = processWord(d, a, b, c, getBlock(i, 5), S12, [0x2A, 0xC6, 0x87, 0x47], F);
            c = processWord(c, d, a, b, getBlock(i, 6), S13, [0x13, 0x46, 0x30, 0xA8], F);
            b = processWord(b, c, d, a, getBlock(i, 7), S14, [0x01, 0x95, 0x46, 0xFD], F);
            a = processWord(a, b, c, d, getBlock(i, 8), S11, [0xD8, 0x98, 0x80, 0x69], F);
            d = processWord(d, a, b, c, getBlock(i, 9), S12, [0xAF, 0xF7, 0x44, 0x8B], F);
            c = processWord(c, d, a, b, getBlock(i, 10), S13, [0xB1, 0x5B, 0xFF, 0xFF], F);
            b = processWord(b, c, d, a, getBlock(i, 11), S14, [0xBE, 0xD7, 0x5C, 0x89], F);
            a = processWord(a, b, c, d, getBlock(i, 12), S11, [0x22, 0x11, 0x90, 0x6B], F);
            d = processWord(d, a, b, c, getBlock(i, 13), S12, [0x93, 0x71, 0x98, 0xFD], F);
            c = processWord(c, d, a, b, getBlock(i, 14), S13, [0x8E, 0x43, 0x79, 0xA6], F);
            b = processWord(b, c, d, a, getBlock(i, 15), S14, [0x21, 0x08, 0xB4, 0x49], F);

            a = processWord(a, b, c, d, getBlock(i, 1), S21, [0x62, 0x25, 0x1E, 0xF6], G);
            d = processWord(d, a, b, c, getBlock(i, 6), S22, [0x40, 0xB3, 0x40, 0xC0], G);
            c = processWord(c, d, a, b, getBlock(i, 11), S23, [0x51, 0x5A, 0x5E, 0x26], G);
            b = processWord(b, c, d, a, getBlock(i, 0), S24, [0xAA, 0xC7, 0xB6, 0xE9], G);
            a = processWord(a, b, c, d, getBlock(i, 5), S21, [0x5D, 0x10, 0x2F, 0xD6], G);
            d = processWord(d, a, b, c, getBlock(i, 10), S22, [0x53, 0x14, 0x44, 0x02], G);
            c = processWord(c, d, a, b, getBlock(i, 15), S23, [0x81, 0xE6, 0xA1, 0xD8], G);
            b = processWord(b, c, d, a, getBlock(i, 4), S24, [0xC8, 0xFB, 0xD3, 0xE7], G);
            a = processWord(a, b, c, d, getBlock(i, 9), S21, [0xE6, 0xCD, 0xE1, 0x21], G);
            d = processWord(d, a, b, c, getBlock(i, 14), S22, [0xD6, 0x07, 0x37, 0xC3], G);
            c = processWord(c, d, a, b, getBlock(i, 3), S23, [0x87, 0x0D, 0xD5, 0xF4], G);
            b = processWord(b, c, d, a, getBlock(i, 8), S24, [0xED, 0x14, 0x5A, 0x45], G);
            a = processWord(a, b, c, d, getBlock(i, 13), S21, [0x05, 0xE9, 0xE3, 0xA9], G);
            d = processWord(d, a, b, c, getBlock(i, 2), S22, [0xF8, 0xA3, 0xEF, 0xFC], G);
            c = processWord(c, d, a, b, getBlock(i, 7), S23, [0xD9, 0x02, 0x6F, 0x67], G);
            b = processWord(b, c, d, a, getBlock(i, 12), S24, [0x8A, 0x4C, 0x2A, 0x8D], G);

            a = processWord(a, b, c, d, getBlock(i, 5), S31, [0x42, 0x39, 0xFA, 0xFF], H);
            d = processWord(d, a, b, c, getBlock(i, 8), S32, [0x81, 0xF6, 0x71, 0x87], H);
            c = processWord(c, d, a, b, getBlock(i, 11), S33, [0x22, 0x61, 0x9D, 0x6D], H);
            b = processWord(b, c, d, a, getBlock(i, 14), S34, [0x0C, 0x38, 0xE5, 0xFD], H);
            a = processWord(a, b, c, d, getBlock(i, 1), S31, [0x44, 0xEA, 0xBE, 0xA4], H);
            d = processWord(d, a, b, c, getBlock(i, 4), S32, [0xA9, 0xCF, 0xDE, 0x4B], H);
            c = processWord(c, d, a, b, getBlock(i, 7), S33, [0x60, 0x4B, 0xBB, 0xF6], H);
            b = processWord(b, c, d, a, getBlock(i, 10), S34, [0x70, 0xBC, 0xBF, 0xBE], H);
            a = processWord(a, b, c, d, getBlock(i, 13), S31, [0xC6, 0x7E, 0x9B, 0x28], H);
            d = processWord(d, a, b, c, getBlock(i, 0), S32, [0xFA, 0x27, 0xA1, 0xEA], H);
            c = processWord(c, d, a, b, getBlock(i, 3), S33, [0x85, 0x30, 0xEF, 0xD4], H);
            b = processWord(b, c, d, a, getBlock(i, 6), S34, [0x05, 0x1D, 0x88, 0x04], H);
            a = processWord(a, b, c, d, getBlock(i, 9), S31, [0x39, 0xD0, 0xD4, 0xD9], H);
            d = processWord(d, a, b, c, getBlock(i, 12), S32, [0xE5, 0x99, 0xDB, 0xE6], H);
            c = processWord(c, d, a, b, getBlock(i, 15), S33, [0xF8, 0x7C, 0xA2, 0x1F], H);
            b = processWord(b, c, d, a, getBlock(i, 2), S34, [0x65, 0x56, 0xAC, 0xC4], H);

            a = processWord(a, b, c, d, getBlock(i, 0), S41, [0x44, 0x22, 0x29, 0xF4], I);
            d = processWord(d, a, b, c, getBlock(i, 7), S42, [0x97, 0xFF, 0x2A, 0x43], I);
            c = processWord(c, d, a, b, getBlock(i, 14), S43, [0xA7, 0x23, 0x94, 0xAB], I);
            b = processWord(b, c, d, a, getBlock(i, 5), S44, [0x39, 0xA0, 0x93, 0xFC], I);
            a = processWord(a, b, c, d, getBlock(i, 12), S41, [0xC3, 0x59, 0x5B, 0x65], I);
            d = processWord(d, a, b, c, getBlock(i, 3), S42, [0x92, 0xCC, 0x0C, 0x8F], I);
            c = processWord(c, d, a, b, getBlock(i, 10), S43, [0x7D, 0xF4, 0xEF, 0xFF], I);
            b = processWord(b, c, d, a, getBlock(i, 1), S44, [0xD1, 0x5D, 0x84, 0x85], I);
            a = processWord(a, b, c, d, getBlock(i, 8), S41, [0x4F, 0x7E, 0xA8, 0x6F], I);
            d = processWord(d, a, b, c, getBlock(i, 15), S42, [0xE0, 0xE6, 0x2C, 0xFE], I);
            c = processWord(c, d, a, b, getBlock(i, 6), S43, [0x14, 0x43, 0x01, 0xA3], I);
            b = processWord(b, c, d, a, getBlock(i, 13), S44, [0xA1, 0x11, 0x08, 0x4E], I);
            a = processWord(a, b, c, d, getBlock(i, 4), S41, [0x82, 0x7E, 0x53, 0xF7], I);
            d = processWord(d, a, b, c, getBlock(i, 11), S42, [0x35, 0xF2, 0x3A, 0xBD], I);
            c = processWord(c, d, a, b, getBlock(i, 2), S43, [0xBB, 0xD2, 0xD7, 0x2A], I);
            b = processWord(b, c, d, a, getBlock(i, 9), S44, [0x91, 0xD3, 0x86, 0xEB], I);

            a = addWords(a, AA);
            b = addWords(b, BB);
            c = addWords(c, CC);
            d = addWords(d, DD);
        }

        return convertToHex(a, b, c, d);
    };

    self.fromUTF8 = function (str) {
        return computeHash(bytesFromUTF8(str));
    };

    self.fromHex = function (str) {
        return computeHash(bytesFromHex(str));
    };

    self.fromBase64 = function (str) {
        return computeHash(bytesFromBase64(str));
    };

    return self;
};


