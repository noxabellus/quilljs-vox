# Vox Editor (QuillJS version, archive)

A semi-complete text editor, shelved in favor of [a new version written with slatejs](https://github.com/noxabellus/vox)

## State of the archive
+ 🟩 document format compatible with version control
+ 🟩 undo/redo to the beginning or end of time, even after save/load
+ 🟨 standard editor tools
    - 🟩 basic formatting
        * 🟩 bold
        * 🟩 italic
        * 🟩 underline
        * 🟩 strike-through
        * 🟩 subscript
        * 🟩 superscript
    - 🟩 text alignment
        + 🟩 left
        + 🟩 center
        + 🟩 right
        + 🟩 justified
    - 🟩 font size selection
    - 🟩 font family selection
    - 🟩 font color and highlight selection
    - 🟨 rich pasting of html
    - 🟨 embeds
        * 🟩 pasting images from html
        * 🟥 pasting images from file
        * 🟥 image insertion tool
    - 🟥 lists
    - 🟥 tables
    - 🟥 links
    - 🟥 horizontal rule
    - 🟥 inline code blocks
    - 🟥 style sets (like google docs)
    - 🟨 sections
        * 🟩 headers
        * 🟩 paragraphs
        * 🟥 blocks (like markdown block quotes)
        * 🟥 table of contents
    - 🟥 editorial kit
        * 🟥 positional comments
+ 🟩 custom fonts
+ 🟨 custom keybinds
    - 🟥 basic rebinding of editor commands
    - 🟥 custom action functions
+ 🟥 fast navigation between locations in the document
    - 🟥 user-defined location bookmarks
    - 🟥 serializable stack of cursor locations navigable by forward/back
    - 🟥 section links
+ 🟨 editor themes
    - 🟩 dark mode
    - 🟥 light mode
    - 🟥 custom themes
+ 🟨 export to html
    - 🟩 basic export of document, 1:1 of what is shown in editor
    - 🟩 custom document theme (basic properties like page width, color, etc)
    - 🟥 custom document css
    - 🟥 choice of how html is formatted (minify/beautify/etc)

## Dependencies
+ quill 2 & parchment
+ electron 30
+ typescript 5
+ react 18
+ styled-components 6
+ webpack 5 & various plugins
+ js-beautify
+ html-minifier
+ eslint
