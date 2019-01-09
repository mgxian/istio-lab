FROM envoyproxy/envoy:latest

RUN apt-get update \
    && apt-get -q install -y curl \
    && apt-get clean
EXPOSE 80 443
CMD /usr/local/bin/envoy -c /etc/front-envoy.yaml --service-cluster front-proxy