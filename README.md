# RPL-2.0-web

* [How to contribute](#how-to-contribute)
    - [Coding](#coding)
    - [Deploying](#deploying)
* [How to run it in DEV](#how-to-run-it-in-dev)
* [How to run it in PROD local via minikube](#how-to-run-it-in-prod-local-via-minikube)
    - [Configuration](#configuration)
    - [Starting minikube](#starting-minikube)
    - [Running the webapp service](#running-the-webapp-service)

## How to contribute

### Coding

1. Clone the repo
2. Create a branch with the following format:
    - `feature/*`: If you are developing a new feature.
    - `bug/*`: If you are fixing a bug.
    - `chore/*`: If you are working on other kind of task.
3. When the code is ready and was properly tested, create a descriptive Pull Request, assign a reviewer and wait for some feedback.
4. Once the Pull Request is approved, merge it with _**"Squash and Merge"**_ (please check that everything is working fine before merging).

### Deploying

The repo has Continuous Deployment, so everything merged to `main` is deployed to prod. Please follow the GitHub action to make sure that the deployment was successful.

If you want to test a branch in prod env, you can create a `test/*` branch, this will trigger a deployment to prod. It's extremely important to be careful while using test branches since that code will go to prod :smile:.

## How to run it in DEV

For installing all dependencies, you should run:

```shell script
nvm use
npm i
```

Set the backend URLs in a `.env.development` file (create this file at root of the project if you don't have it). 

For running RPL-2.0-web against a local environment you should set the local URLs where you have the backends APIs running:

```shell script
USERS_API_BASE_URL=http://localhost:8000/api/v3
ACTIVITIES_API_BASE_URL=http://localhost:8001/api/v3
```

Once you have this set, you could start the service running:

```shell script
npm run start
```

Note: For testing image upload features locally, you will need to also set the `CLOUDINARY_UPLOAD_PRESET` and `CLOUDINARY_URL` env variables in `.env.development` file. Ask these values to another contributor.

## How to run it in PROD local via minikube

### Configuration

- Download and install [Minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/)
- Download and install [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)

### Starting minikube

- Run the following command for starting the cluster:

```shell script
minikube start \
  --memory 8096 \
  --extra-config=controller-manager.horizontal-pod-autoscaler-upscale-delay=1m \
  --extra-config=controller-manager.horizontal-pod-autoscaler-downscale-delay=2m \
  --extra-config=controller-manager.horizontal-pod-autoscaler-sync-period=10s
```

Note: If you are running on mac you will need the flag `--vm-driver hyperkit`.


### Running the webapp service

- **First of all, you have to run the backend services before starting the frontend.** Instructions in [rpl-3.0-backend](https://github.com/MiguelV5/RPL-3.0).

- Set the backend cluster url in the `.env.development`

```shell script
# redirection (and thus v3) already set in nginx path configs
USERS_API_BASE_URL=/users_api
ACTIVITIES_API_BASE_URL=/activities_api
```



- Build the minified static html and js in the `dist` folder (then we have to serve `dist/index.html` it with our prefered static server (node serve, nginx, php, etc)):

```shell script
npm i
npm run build-dev # This command is the same as build but using the .env.development instead of the .env.production
```

Note: if you want to test it without `nvm`, you can use a node docker image directly, e.g.:

```shell script
docker run --rm -v "$(pwd)":/app -w /app node:14 bash -c "npm install && npm run build-dev"
```

- Modify `nginx.conf` with the correct configuration (see the file for more details).

- Build the docker image and load it into minikube:

```shell script
docker build -t web_rpl:local .
minikube image load web_rpl:local
```

- Temporarily set the image value in the `kubernetes/deployments/web.yaml` to `web_rpl:local`.

- Create the kubernetes webapp service and deployment:
```shell script
kubectl create -f ./kubernetes/services/web.yaml
kubectl create -f ./kubernetes/deployments/web.yaml
```

Note: If you are having issues with the Docker image in kubernetes, maybe you should add the `imagePullPolicy: IfNotPresent` to the `kubernetes/deployments/web.yaml`

Now we should have RPL-2.0-web up and running with kubernetes :rocket:

We are using the reverse_proxy nginx so all requests to backend should be properly directed within the kubernetes cluser.

Every api call directed to either `<minikube webapp ip>/users_api/*` or `<minikube webapp ip>/activities_api/*` will be redirected to `<respective minikube backend service ip>/api/v3/*`.

To access the webapp, get the ip address of the cluster and then the port of the service:
```shell script
minikube ip
kubectl get services
```

To stop the deployment or the service, you can run:

```shell script
kubectl delete -f ./kubernetes/deployments/web.yaml
kubectl delete -f ./kubernetes/services/web.yaml
```

If you want to stop everything at once, you can run this:
(WARNING: this will stop ALL deployments/services within the namespace, not just the webapp)

```shell script
kubectl delete --all deployments --namespace=default
kubectl delete --all services --namespace=default
```

