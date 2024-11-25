#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RdsInfraStack } from '../lib/rds-infra-stack';

const app = new cdk.App();
new RdsInfraStack(app, 'RdsInfraStack', {});