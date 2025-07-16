This directory is intended to be pulled on the server.

```bash
mkdir store
cd store
git init
git remote add -f origin https://github.com/hlud6646/storeSimul3
git config core.sparseCheckout true
echo "remote" >> .git/info/sparse-checkout
echo "database" >> .git/info/sparse-checkout
git pull origin master
```

