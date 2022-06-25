#!/bin/sh

openssl genrsa -out key.pem 2048
openssl req -new -out csr.pem -key key.pem -config cert.conf
openssl x509 -req -days 3650 -in csr.pem -signkey key.pem -out cert.pem -extensions v3_req -extfile cert.conf
