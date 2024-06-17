# Erodev

Erodev is a lightweight development server for Deno that assists web developers by automatically reloading HTML, CSS, and JavaScript files when they are modified. This eliminates the need to manually refresh the browser.

## Features

- **Automatic Reloading**: Automatically reloads your HTML, CSS, and JavaScript files when changes are detected.
- **Simple Setup**: Easy to configure and use.
- **Lightweight**: Minimal dependencies and easy on system resources.
- **Cross-Platform**: Works on any platform that supports Deno.js.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install Erodev, ensure you have Deno installed on your system. You can install Deno from [the official website](https://deno.land/).

Once Deno is installed, you can run Erodev with the following command:

```sh
deno run --allow-net --allow-read jsr:@ero/dev@^0.1.0
```
Alternatively, you can install using deno install

```sh
deno install --allow-net --allow-read -n erodev jsr:@ero/dev@^0.1.0
```
Now run `erodev`

## Usage

Erodev can be started from the command line. Navigate to the root of your project directory and run:

```sh
deno run --allow-net --allow-read jsr:@ero/dev@^0.1.0
```

By default, Erodev will serve files from the current directory on port 5502. You can specify a different directory or port if needed.

## Example

```sh
deno run --allow-net --allow-read jsr:@ero/dev@^0.1.0 --port=3000
```

## Configuration

You can configure Erodev using command-line options:

- `--port`: Specify the port to listen on (default is 5502).

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

1. Fork the repository.
2. Create your feature branch (git checkout -b feature/fooBar).
3. Commit your changes (git commit -am 'Add some fooBar').
4. Push to the branch (git push origin feature/fooBar).
5. Create a new Pull Request.

## License

Erodev is licensed under the MIT License. See the [LICENSE](./LICENSE) for more information.

## Contact

If you have any questions or need further assistance, feel free to reach out at [email](mailto:eboselumepaul@gmail.com).

Thank you for using Erodev! Happy coding!

