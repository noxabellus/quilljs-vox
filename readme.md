# Vox Editor

WIP rich text editor

## Planned features
+ 🟩 document format compatible with version control
+ 🟩 undo/redo to the beginning or end of time
+ 🟨 google-docs-like editor tools
    - 🟩 basic formatting (bold, italic, underline, etc)
    - 🟩 paragraph alignment
    - 🟥 font size selection
    - 🟥 font family selection
    - 🟥 embeds
    - 🟥 inline code blocks
    - 🟥 sections
        * 🟥 headers
        * 🟥 blocks
        * 🟥 style sets
        * 🟥 table of contents
    - 🟥 comments and other editorial kit
    - 🯄 paging mode
+ 🟨 editor themes
    - 🟩 dark mode
    - 🟥 light mode
    - 🟥 custom themes
+ 🟥 custom fonts
+ 🟨 export to html
    - 🟩 basic export
    - 🟥 custom document css
    - 🟥 custom html templates
+ 🟥 export to markdown
    - 🟥 basic export
    - 🟥 custom view css
    - 🟥 github style view
+ 🯄 collaborative editing
+ 🯄 workspace/multi-document mode


> * 🟩 implemented >75%
> * 🟨 in progress
> * 🟥 not yet implemented
> * 🯄 possible, actual inclusion undecided

## Dependencies
+ quill 2
+ electron 30
+ typescript 5
+ webpack 5 & various plugins

#### Possible future dependencies
+ highlight.js
+ minimal code editor of some kind (for css, html templates, inline code blocks)
