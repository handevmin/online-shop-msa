import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// 서울 리전 설정
const awsProvider = new aws.Provider("awsProvider", {
    region: "ap-northeast-2"
});

// VPC 설정
const vpc = new aws.ec2.Vpc("myVpc", {
    cidrBlock: "10.0.0.0/16",
    enableDnsHostnames: true,
    enableDnsSupport: true,
    tags: {
        Name: "my-vpc",
    },
}, { provider: awsProvider });

// 인터넷 게이트웨이 생성
const internetGateway = new aws.ec2.InternetGateway("myInternetGateway", {
    vpcId: vpc.id,
    tags: {
        Name: "my-internet-gateway",
    },
}, { provider: awsProvider });

// 가용 영역 가져오기
const availabilityZones = aws.getAvailabilityZones({
    state: "available",
});

// 퍼블릭 서브넷 생성
const publicSubnets = availabilityZones.then(azs => 
    azs.names.slice(0, 2).map((az, i) => 
        new aws.ec2.Subnet(`publicSubnet-${i}`, {
            vpcId: vpc.id,
            cidrBlock: `10.0.${i*2}.0/24`,
            availabilityZone: az,
            mapPublicIpOnLaunch: true,
            tags: {
                Name: `public-subnet-${i}`,
            },
        }, { provider: awsProvider })
    )
);

// 라우트 테이블 생성
const publicRouteTable = new aws.ec2.RouteTable("publicRouteTable", {
    vpcId: vpc.id,
    routes: [
        {
            cidrBlock: "0.0.0.0/0",
            gatewayId: internetGateway.id,
        },
    ],
    tags: {
        Name: "public-route-table",
    },
}, { provider: awsProvider });

// 라우트 테이블 연결
publicSubnets.then(subnets => 
    subnets.map((subnet, i) => 
        new aws.ec2.RouteTableAssociation(`publicRtAssociation-${i}`, {
            subnetId: subnet.id,
            routeTableId: publicRouteTable.id,
        }, { provider: awsProvider })
    )
);

// RDS 서브넷 그룹 생성
const dbSubnetGroup = new aws.rds.SubnetGroup("myDbSubnetGroup", {
    name: pulumi.interpolate`mydbsubnetgroup-${pulumi.getStack()}`,
    subnetIds: pulumi.output(publicSubnets).apply(subnets => subnets.map(s => s.id)),
    tags: {
        Name: "My DB subnet group",
    },
}, { provider: awsProvider, dependsOn: [vpc] });

// RDS용 보안 그룹 생성
const rdsSecurityGroup = new aws.ec2.SecurityGroup("rdsSecurityGroup", {
    vpcId: vpc.id,
    ingress: [
        { protocol: "tcp", fromPort: 3306, toPort: 3306, cidrBlocks: ["0.0.0.0/0"] },
    ],
    egress: [
        { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ],
    tags: {
        Name: "rds-security-group",
    },
}, { provider: awsProvider });

// RDS 인스턴스 설정
const rdsInstance = new aws.rds.Instance("myRdsInstance", {
    identifier: pulumi.interpolate`myrdsinstance-${pulumi.getStack()}`,
    engine: "mysql",
    instanceClass: "db.t3.micro",
    allocatedStorage: 20,
    dbName: "mydb",
    username: "admin",
    password: "password",
    skipFinalSnapshot: true,
    publiclyAccessible: true,
    vpcSecurityGroupIds: [rdsSecurityGroup.id],
    dbSubnetGroupName: dbSubnetGroup.name,
}, { provider: awsProvider, dependsOn: [dbSubnetGroup] });

// S3 버킷 설정
const bucketName = pulumi.interpolate`my-static-website-bucket-${pulumi.getStack()}-${Date.now()}`;
const bucket = new aws.s3.Bucket("myStaticWebsiteBucket", {
    bucket: bucketName,
    website: {
        indexDocument: "index.html",
        errorDocument: "error.html",
    },
    forceDestroy: true,
}, { provider: awsProvider });

// 버킷 정책 수동 등록 방법:
// 1. AWS 콘솔에서 S3 서비스로 이동
// 2. 생성된 버킷 (my-static-website-bucket-...) 선택
// 3. '권한' 탭으로 이동
// 4. '버킷 정책' 섹션에서 '편집' 클릭
// 5. 다음 JSON 정책을 붙여넣기 (버킷 이름 변경 필요):
/*
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}

Resource 예제:
            "Resource": "arn:aws:s3:::my-static-website-bucket-dev-1723706813958/*"

*/
// 6. 'your-bucket-name'을 실제 생성된 버킷 이름으로 변경
// 7. '변경 사항 저장' 클릭

// 퍼블릭 액세스 차단 설정 비활성화
const publicAccessBlock = new aws.s3.BucketPublicAccessBlock("myBucketPublicAccessBlock", {
    bucket: bucket.id,
    blockPublicAcls: false,
    blockPublicPolicy: false,
    ignorePublicAcls: false,
    restrictPublicBuckets: false,
}, { provider: awsProvider });

// CloudFront 배포 설정
const distribution = new aws.cloudfront.Distribution("myDistribution", {
    enabled: true,
    origins: [{
        originId: bucket.arn,
        domainName: bucket.websiteEndpoint,
        customOriginConfig: {
            httpPort: 80,
            httpsPort: 443,
            originProtocolPolicy: "http-only",
            originSslProtocols: ["TLSv1.2"],
        },
    }],
    defaultCacheBehavior: {
        targetOriginId: bucket.arn,
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD", "OPTIONS"],
        cachedMethods: ["GET", "HEAD", "OPTIONS"],
        forwardedValues: {
            queryString: false,
            cookies: { forward: "none" },
        },
        minTtl: 0,
        defaultTtl: 3600,
        maxTtl: 86400,
    },
    restrictions: {
        geoRestriction: {
            restrictionType: "none",
        },
    },
    viewerCertificate: {
        cloudfrontDefaultCertificate: true,
    },
}, { provider: awsProvider });

// Jenkins 설치 스크립트
const jenkinsInstallScript = `#!/bin/bash
# Jenkins 설치 스크립트

# 시스템 업데이트
sudo apt-get update
sudo apt-get upgrade -y

# Java 설치
sudo apt-get install -y openjdk-11-jdk

# Jenkins 저장소 키 추가
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null

# Jenkins 저장소 추가
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

# Jenkins 설치
sudo apt-get update
sudo apt-get install -y jenkins

# Jenkins 서비스 시작 및 활성화
sudo systemctl start jenkins
sudo systemctl enable jenkins

# 방화벽 설정 (필요한 경우)
sudo ufw allow 8080

# 초기 관리자 비밀번호 출력 (선택사항)
echo "Jenkins initial admin password: "
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
`;

// Jenkins 서버 설정
const jenkinsSecurityGroup = new aws.ec2.SecurityGroup("jenkinsSecurityGroup", {
    name: pulumi.interpolate`jenkins-sg-${pulumi.getStack()}`,
    description: "Security group for Jenkins server",
    vpcId: vpc.id,
    ingress: [
        { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 8080, toPort: 8080, cidrBlocks: ["0.0.0.0/0"] },
    ],
    egress: [
        { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] },
    ],
}, { provider: awsProvider });

const jenkinsInstance = new aws.ec2.Instance("jenkinsInstance", {
    instanceType: "t3.micro",
    // Ubuntu Server 22.04 LTS AMI (서울 리전, x86 및 ARM)
    ami: "ami-056a29f2eddc40520",  // 64비트(x86)
    vpcSecurityGroupIds: [jenkinsSecurityGroup.id],
    subnetId: pulumi.output(publicSubnets).apply(subnets => subnets[0].id),
    keyName: "my-keypair",
    userData: Buffer.from(jenkinsInstallScript).toString('base64'),  // 설치 스크립트 추가
    tags: {
        Name: pulumi.interpolate`JenkinsServer-${pulumi.getStack()}`,
    },
}, { provider: awsProvider, dependsOn: [vpc] });

// 출력
export const vpcId = vpc.id;
export const publicSubnetIds = pulumi.output(publicSubnets).apply(subnets => subnets.map(s => s.id));
export const rdsEndpoint = rdsInstance.endpoint;
export const rdsPort = rdsInstance.port;
export const s3BucketName = bucket.id;
export const s3WebsiteEndpoint = bucket.websiteEndpoint;
export const distributionDomain = distribution.domainName;
export const jenkinsPublicIp = jenkinsInstance.publicIp;