export default (selector: string) => `
    ${selector} {
        width: var(--document-width);
        border: var(--document-border-size) solid var(--document-border-color);
        border-radius: var(--document-border-radius);
        font-family: var(--document-base-font-family);
        font-size: var(--document-base-font-size);
        font-weight: var(--document-base-font-weight);
        color: var(--document-base-font-color);
        background-color: var(--document-page-color);
        padding: var(--document-padding);
        margin: var(--document-margin);
        line-height: 1.42;
        tab-size: 4;
    }

    ${selector} h1 {
        font-family: var(--document-heading-1-font-family);
        font-size: var(--document-heading-1-font-size);
    }

    ${selector} h2 {
        font-family: var(--document-heading-2-font-family);
        font-size: var(--document-heading-2-font-size);
    }

    ${selector} h3 {
        font-family: var(--document-heading-3-font-family);
        font-size: var(--document-heading-3-font-size);
    }

    ${selector} h4 {
        font-family: var(--document-heading-4-font-family);
        font-size: var(--document-heading-4-font-size);
    }

    ${selector} h5 {
        font-family: var(--document-heading-5-font-family);
        font-size: var(--document-heading-5-font-size);
    }

    ${selector} h6 {
        font-family: var(--document-heading-6-font-family);
        font-size: var(--document-heading-6-font-size);
    }
`;
