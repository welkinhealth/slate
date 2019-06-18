<p align="center">
  <img src="https://raw.githubusercontent.com/lord/img/master/logo-slate.png" alt="Slate: API Documentation Generator" width="226">
</p>

<p align="center">Welkin uses Slate to create our API documentation. <a href="https://developers.welkinhealth.com">developers.welkinhealth.com</a></p>

Getting Started with Slate
------------------------------

### Prerequisites

 - **Ruby, version 2.3.1 or newer**
 - **Bundler** — If Ruby is already installed, but the `bundle` command doesn't work, just run `gem install bundler` in a terminal.

### Getting Set Up for Welkin API Doc development

1. Clone welkinhealth/slate to your hard drive with `git clone https://github.com/welkinhealth/slate.git`
2. `cd slate`
3. Initialize Slate:
```shell
git config core.hooksPath .githooks
bundle install
```
4. Run Slate:
```shell
bundle exec middleman server
```

You can now see the docs at [http://localhost:4567](http://localhost:4567). Whoa! That was fast!

### Updating documentation

1. `enter_welkin_env`
2. Make changes to okapi files
3. Run the markdown generator:

```shell
python okapi/scripts/run_doc.py --target=docs.index > ../slate/source/index.html.md
```

Slate Contributors
------------------------------

Slate was built by [Robert Lord](https://lord.io) while interning at [TripIt](https://www.tripit.com/).

Thanks to the following people who have submitted major pull requests:

- [@chrissrogers](https://github.com/chrissrogers)
- [@bootstraponline](https://github.com/bootstraponline)
- [@realityking](https://github.com/realityking)
- [@cvkef](https://github.com/cvkef)

Also, thanks to [Sauce Labs](http://saucelabs.com) for sponsoring the development of the responsive styles.
