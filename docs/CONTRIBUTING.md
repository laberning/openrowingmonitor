# Contributing Guidelines to OpenRowingMonitor

Thank you for considering contributing to [OpenRowingMonitor](https://github.com/JaapvanEkris/openrowingmonitor). Help is always welcome, and even if you are an absolute beginner in both rowing and coding, you can still help in your own way.

Please read the following sections in order to know how to ask questions and how to work on something. OpenRowingMonitor is a spare time project where [many have contributed already](attribution.md) and made things possible we never ever dared to dream of. People who contribute are [attributed](attribution.md) and are mentioned in the [release notes](Release_Notes.md) as a way of saying thank you, as OpenRowingMonitor has grown a lot thanks to the community that supports it, and it would never have become what it is now, if it wasn't for these great community contributions and discussions.

## Code of Conduct

All contributors are expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md). We want this to be a place where everyone feels comfortable. We deeply understand passion for a specific feature, but please be respectfull when other people to contribute their vision as well. Please make sure you are welcoming and friendly to others.

## How can I contribute?

Keep an open mind! There are many ways for helpful contributions, like:

* Writing forum posts
* Helping people on the forum
* Submitting bug reports and feature requests
* Improving the documentation or point out unclear passages
* Testing the app on new machines
* Submitting rower profiles / test recordings
* Writing code which can be incorporated into the project itself

### Report bugs and submit feature requests

Look for existing issues and pull requests if the problem or feature has already been reported. If you find an issue or pull request which is still open, please add comments to it instead of opening a new one as it makes seeing the patterns in bad behaviour for us much easier.

Make sure that you are running the latest stable version of OpenRowingMonitor before submitting a bug report.

If you report a bug, please include information that can help to investigate the issue further, such as:

* Rower Model and Setup
* Model of Raspberry Pi and version of operation system
* Relevant parts of log messages
* If possible, describe a [Minimal, Reproducible Example](https://stackoverflow.com/help/minimal-reproducible-example)
* If relevant and possible, make raw recordings of the rowing session

### Improving the Documentation

The documentation is an important part of OpenRowingMonitor. It is essential that it remains simple and accurate. If you have improvements or find errors, feel free to submit changes via Pull Requests or by filing a bug report or feature request.

### Contributing to the Code

Keep in mind that OpenRowingMonitor is a spare time project to improve the performance of rowing machines. We intend to keep the code base clean and maintainable, but we will gladly help you add new features to our code. So please realise that contributed code might be refactored before being admitted. Especially we welcome

* Fixing bugs for existing functions
* Enhance the API or implementation of an existing function, configuration or documentation

Academics who use OpenRowingMonitor and improve the math or physics models are more than welcome, and we gladly help you in understanding our setup and discussing your needs, providing that essential improvements in the models will flow back to our codebase.

If you want to contribute new features or major modifications to the code, please first discuss the change so we can better understand your plans and we can help you place this better in the application. Best way to do this is via an issue or the forum. This will make sure that we all have as much fun in implementing new ideas and people don't spend much time on working on things we need to refactor.

#### Standards for Contributions

* Please thorougly test all code, especially if it requires external devices like smartwatches etc..
* If possible there should be automated test for your contribution (see the `*.test.js` files; the project uses `uvu`). You can look for inspiration in the [rowing engine directory](https://github.com/JaapvanEkris/openrowingmonitor/tree/main/app/engine)

#### Creating a Pull Request

Only open a Pull Request when your contribution is ready for a review. If you want to get feedback on a contribution that does not yet match all criteria for a Pull Request you can open a [Draft pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests#draft-pull-requests).

* Please include a brief summary of the change, mentioning any issues that are fixed (or partially fixed) by this change
* Include relevant motivation and context
* Make sure that the PR only includes your intended changes by carefully reviewing the changes in the diff
* If possible / necessary, add tests and documentation to your contribution
* If possible, [sign your commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)

We will review and test your contribution and respond as quickly as possible. Keep in mind that this is a spare time Open Source project, and it may take some time to get back to you. We typically run a lot of tests, which often involves a lot of live rowing, before we accept any code to our main branch, so it typically will take some time before code is accepted. Your patience is very much appreciated.

## Your First Contribution

Don't worry if you are new to contributing to an Open Source project. Here are a couple of tutorials that you might want to check out to get up to speed:

* [How to Contribute to an Open Source Project on GitHub](https://makeapullrequest.com)
* [First Timers Only](https://www.firsttimersonly.com)
