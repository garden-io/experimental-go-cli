# _Experimental_ Go CLI

This package contains a **highly experimental** CLI for [Garden](https://github.com/garden-io/garden), written in Golang.

The code in this repository was originally a part of the main [Garden repo](https://github.com/garden-io/garden). At [this tag](https://github.com/garden-io/garden/tree/v0.9.0), the Go CLI is included in the main source under `garden-cli`. [Here's the PR](https://github.com/garden-io/garden/pull/515) for removing it, and here's the [original issue](https://github.com/garden-io/garden/issues/468).

## Getting started

### Install dependencies

* [Golang](https://golang.org/doc/install)
* [dep](https://github.com/golang/dep), a Go dependency management tool
* [Mutagen](https://mutagen.io/), version `0.7.0` (has to be that exact version)

### Set up

First clone the repo into your `$GOPATH`:

```sh
git clone https://github.com/garden-io/experimental-go-cli.git $GOPATH/github.com/garden-io/`
```

Then start the Mutagen daemon with:

```sh
mutagen daemon start
```

Finally, change into the `cli` directory:

```sh
cd cli
```

and build the package with:

```sh
go build -o build/garden
```

Now you can use the built Go binary as you would normally use Garden.

## Usage

We currently don't ship the built binary of the Go CLI. To use, please follow the [Getting started](#getting-started) instructions above to install and build the binary yourself.

Once that's done, it can be convenient to alias the Go binary:

```sh
alias garden_go=$GOPATH/github.com/garden-io/experimental-go-cli/cli/build/garden
```

Now, you can use `garden_go` just like you would normally use Garden. For example, in some Garden project, run:

```sh
garden_go deploy
```

**Note**: It's currently not recommended to use the Go CLI inside the [examples](https://github.com/garden-io/garden/tree/main/examples) directory included with the main Garden source. This is a known limitation, [see below](#ssue-when-running-in-examples-directory).

## How it works

The Go CLI is just a thin wrapper around the containerized version of the [garden-service package](https://github.com/garden-io/garden/tree/main/garden-service), that uses [Mutagen](https://mutagen.io/) for file syncing. The `garden-service`Docker image is available on [Dockerhub](ihttps://hub.docker.com/r/gardenengine/garden-service) and updated on every merge to main.

For the first run, the CLI:

1. Creates a named volume for the project.
2. Creates and starts a `garden-sync` container that mounts the named volume.
3. Starts a sync session between the host and the `garden-sync` container that syncs the contents of the local project directory into the named project volume and watches for changes.
4. Starts a `garden-service` container that mounts the named volume.
5. Runs the command inside the `garden-service` container and streams the output.

 The containers, volume and sync session are persistent, and unique to a given project. So, for an existing project, where the steps above have already been performed, the CLI simply `execs` into the `garden-service` container and runs the command.

## Troubleshooting

It can be useful to use the [Mutagen](https://mutagen.io/) CLI to check if everything is all right with the sync process:

```sh
mutagen list
```

To manually terminate a sync session, use:

```sh
mutagen terminate <session-id>
```

To find the Docker volumes created by the Go CLI, use:
```sh
docker volume ls | grep garden-volume
```

To find the Docker containers created by the Go CLI, use:
```sh
docker container ls | grep garden-sync
```
and
```sh
docker volume ls | grep garden-service
```

To access the Docker volume when using Docker for Mac, checkout this [SO answer](https://stackoverflow.com/a/41281658).

## Issue when running in examples directory

It's currently not recommend to use the Go CLI inside the [examples](https://github.com/garden-io/garden/tree/main/examples) directory of the main Garden source. This is because with the current implementation, the Go CLI assumes that the root of the project is the git root, i.e. the directory that contains the `.git` directory.

So, if you've cloned the main Garden repo, the git root contains the entire codebase. The Go CLI would therefore attempt to sync and watch the entire codebase instead of just a particular example project.

You should therefore move an example project into it's own directory and do a `git init` there.
