Installation
npm -g install madge

Graphviz (optional)
Graphviz is only required if you want to generate visual graphs (e.g. in SVG or DOT format).

Mac OS X
brew install graphviz || port install graphviz

Ubuntu
apt-get install graphviz

npm install -g plato



create file sonar-project.properties

sonar.projectKey=your-project-key
sonar.organization=your organization 

sonar.projectName=your project name
sonar.projectVersion=1.0

sonar.sources=src
sonar.tests=test
sonar.language=ts
sonar.sourceEncoding=UTF-8

sonar.javascript.lcov.reportPaths=coverage/lcov.    info
sonar.exclusions=**/*.spec.ts,**/node_modules/**,dist/**
