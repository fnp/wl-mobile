#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sqlite3
import simplejson as j

add_book = "INSERT INTO book (id, title, html_file, html_file_size, parent, parent_number) VALUES (:id, :title, :html, :html_size, :parent, :parent_number);"
add_book_tag = "INSERT INTO book_tag (book, tag) VALUES (:book, :tag);"
add_tag = "INSERT INTO tag (id, category, name, sort_key, _books) VALUES (:id, :category, :name, :sort_key, :_books);"



dbs = sqlite3.connect('Databases.db')
dbs.executescript("""
CREATE TABLE Databases (guid INTEGER PRIMARY KEY AUTOINCREMENT, origin TEXT, name TEXT, displayName TEXT, estimatedSize INTEGER, path TEXT);
CREATE TABLE Origins (origin TEXT UNIQUE ON CONFLICT REPLACE, quota INTEGER NOT NULL ON CONFLICT FAIL);
INSERT INTO Databases VALUES (1, 'file__0', 'wolnelektury', 'Wolne Lektury', 500000, '0000000000000001.db');
INSERT INTO Origins Values ('file__0', 1000000);
""")
dbs.commit()
dbs.close()



db1 = sqlite3.connect('wolnelektury.db')
db2 = sqlite3.connect('0000000000000001.db')

categories = {'author': 'autor',
              'epoch': 'epoka', 
              'genre': 'gatunek', 
              'kind': 'rodzaj', 
              'theme': 'motyw'
              }

schema = """
CREATE TABLE book (
    id INTEGER PRIMARY KEY, 
    title VARCHAR, 
    html_file VARCHAR, 
    html_file_size INTEGER, 
    parent INTEGER,
    parent_number INTEGER
    );
CREATE INDEX IF NOT EXISTS book_title_index ON book (title);
CREATE INDEX IF NOT EXISTS book_parent_index ON book (parent);

CREATE TABLE tag (
    id INTEGER PRIMARY KEY, 
    name VARCHAR, 
    category VARCHAR, 
    sort_key VARCHAR, 
    _books VARCHAR);
CREATE INDEX IF NOT EXISTS tag_name_index ON tag (name);
CREATE INDEX IF NOT EXISTS tag_category_index ON tag (category);
CREATE INDEX IF NOT EXISTS tag_sort_key_index ON tag (sort_key);

CREATE TABLE book_tag (book INTEGER, tag INTEGER);
CREATE INDEX IF NOT EXISTS book_tag_book ON book_tag (book);
CREATE INDEX IF NOT EXISTS book_tag_tag_index ON book_tag (tag);
"""

db1.executescript(schema)
db2.executescript(schema)


def utf8ize(d):
    """ Convert every unicode field of d to unicode consisting
        of its utf-8 representation bytes as characters.
        Yes, this is weird and stupid, but it's what Android does."""

    for f in d:
        if isinstance(d[f], unicode):
            d[f] = d[f].encode('utf-8').decode('latin1')

with open('initial.json') as f:
    data = j.load(f)

books_by_id = {}
tagged = {}

for book in data['added']['books']:
    books_by_id[book['id']] = book

for book in data['added']['books']:
    # gather parents' tags
    parental = []
    b = book
    while 'parent' in b:
        b = books_by_id[b['parent']]
        parental += b['tags']
    parental = set(parental)

    for tag in book['tags']:
        if tag not in parental:
            tagged.setdefault(tag, []).append(book)

del books_by_id


for book in data['added']['books']:
    if 'html' not in book:
        book['html'] = None
    if 'html_size' not in book:
        book['html_size'] = None
    if 'parent' not in book:
        book['parent'] = None
    if 'parent_number' not in book:
        book['parent_number'] = None
    for t in book['tags']:
        db1.execute(add_book_tag, {"book": book['id'], "tag": t})
        db2.execute(add_book_tag, {"book": book['id'], "tag": t})

    db2.execute(add_book, book)
    utf8ize(book)
    db1.execute(add_book, book)

for tag in data['added']['tags']:
    tag['category'] = categories[tag['category']]
    tag['_books'] = ",".join(str(book['id']) for book in sorted(tagged.get(tag['id'], []), key=lambda b: b['title']))

    if tag['category'] == 'theme':
        continue
    
    db2.execute(add_tag, tag)
    utf8ize(tag)
    db1.execute(add_tag, tag)


db1.commit()
db1.close()
db2.commit()
db2.close()
