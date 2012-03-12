# MD5-js

## Introduction

This is an implementation of the MD5 hashing algorithm in JavaScript. It is 
designed to be used on JavaScript applications that need to create checksums 
of data, for example within a browser.

## Usage

For strings, do the following:

    md5().fromUTF8("Hello World");
    
    > b10a8db164e0754105b7a99be72e3fe5

For data encoded in hexadeciaml, do the following:

    md5().fromHex("48656c6c6f20576f726c64");

    > "Not implemented yet"

For data encoded in base64, do the following:

    md5().fromBase64("SGVsbG8gV29ybGQ=");

    > "Not implemented yet"

**Note:** as of v0.8.0, the Hex and Base64 methods are not fully implemented.

# License
This code is licensed under the Simplified BSD License

Copyright 2012 Daniel Thompson. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY DANIEL THOMPSON "AS IS" AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
SHALL DANIEL THOMPSON OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

The views and conclusions contained in the software and documentation are those
of the authors and should not be interpreted as representing official policies,
either expressed or implied, of Daniel Thompson.

