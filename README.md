# summit-view-github
GitHub-panel for Summit View

## Usage

```
var summit = require('summit-view');
var GitHub = require('summit-view-github');

summit.listen(3000);

summit.panels([
    GitHub,
]);
```