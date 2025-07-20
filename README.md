# Whisp: An open-source social media platform

Whisp is an open-source public microblogging and social media platform to connect, share, and engage with others.

## Setup

```bash
git clone https://github.com/linuskang/whisp
cd whisp
npm install
cp .env.example .env # edit the values to your own

sudo mysql
create database your_db_name
CREATE USER 'whisp'@'localhost' IDENTIFIED BY 'your_database_user_password';
GRANT ALL PRIVILEGES ON *.* TO 'whisp'@'localhost';
FLUSH PRIVILEGES;
exit;

npx prisma migrate deploy
npx prisma generate

npm run dev # run the dev server
```

Access Whisp at http://localhost:3000 and signin!

## Licensing

Whisp is licensed under the **Attribution-NonCommercial 4.0 International** license.

Please refer to **[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)** for more information.

### The license permits:

✅ Share, Copy and Redistribute the source in any medium or format.

✅ Adapt, Remix, Transform, and build upon the source.

### Under the following terms:

✅ Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

❌ NonCommercial — You may not use the material for commercial purposes.

❌ No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.

## Credit

Whisp is a project created and owned by **Linus Kang Software** and **Linus Kang**. For any enquires, please contact [mail@linus.id.au](mailto://mail@linus.id.au)
